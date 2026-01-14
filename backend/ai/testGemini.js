const dotenv = require("dotenv");
const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");

dotenv.config();

// 1. Safety Check: Ensure API Key exists
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// 2. Define the JSON schema to force the AI to return valid JSON
const schema = {
  description: "List of batches scheduled in labs",
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      batch: { type: SchemaType.STRING },
      day: { type: SchemaType.STRING },          // ✅ added
      time: { type: SchemaType.STRING },
      classroom: { type: SchemaType.STRING },
      lab_location: { type: SchemaType.STRING },
    },
    required: ["batch", "day", "time", "classroom", "lab_location"], // ✅ added
  },
};

// 3. Initialize model with JSON Response MIME type
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

async function parseTimetable(timetableText) {
  const prompt = `
You are given a college timetable. Extract lab sessions based on the PDF content.

PERIOD MAPPINGS (if mentioned in timetable):
P1 = 9:30 to 10:30
P2 = 10:30 to 11:30
P3 = 11:30 to 12:30
P4 = 12:30 to 1:30
P5 = 1:30 to 2:30
P6 = 2:30 to 3:30
P7 = 3:30 to 4:30
P8 = 4:30 to 5:30

If periods are mentioned, convert them to the actual time range format.

LAB RULES:
- Only extract entries that explicitly mention "LAB" or lab locations
- Extract the lab location name as mentioned in the PDF
- IMPORTANT: For classroom, find a FREE ROOM (available classroom) that comes BEFORE or AFTER the lab time slot on the SAME DAY
- Look at the timetable to identify which classrooms are occupied during the lab time, then assign an unoccupied room nearby

DAY RULES:
- Extract the DAY (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
- If the day is mentioned at the start of a line or as a header, use it
- If the day is not present, DO NOT guess

TIME FORMAT:
- Extract time as "HH:MM to HH:MM" format (e.g., "2:00 to 5:00", "9:30 to 12:30")
- Include both start and end times
- If period notation is used (P1, P2, etc.), convert to actual time ranges using the mappings above

BATCH FORMAT:
- Extract batch names exactly as they appear in the PDF (e.g., "S4 CSE A", "Batch 1", etc.)

CLASSROOM ASSIGNMENT:
- For each lab session, identify a free classroom that is available BEFORE or AFTER the lab time
- Strategy: Look at the SAME batch's schedule on the SAME day
  * Check periods BEFORE the lab - use the classroom from the period right before the lab
  * Check periods AFTER the lab - use the classroom from the period right after the lab
  * If the batch has the same classroom in multiple non-lab periods, use that one
- For example:
  * If C2A has: "Mon B201 B201 LAB LAB B201 B201" → use B201 (available before and after)
  * If C2A has: "Tue B202 B202 B202 B202 B202 B202" → use B202 (batch's primary classroom)
- DO NOT return "N/A" - always identify the actual classroom from the timetable data

TASK:
Return ONLY batches currently in LAB (that explicitly mention LAB or are in lab locations).

Return JSON strictly in this format:
[
  {
    "batch": "S4 CSE A",
    "day": "Monday",
    "time": "2:00 to 5:00",
    "classroom": "B201",
    "lab_location": "CS Lab 2"
  }
]

If no lab sessions found, return empty array: []

Timetable:
${timetableText}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse timetable:", error.message);
    return [];
  }
}

/* ============= TEST FUNCTION ============= */
async function test() {
  const sampleTimetable = `
SECOND SEM - C2A
Day      P1       P2       P3       P4       P5       P6
Mon      B201     B201     LAB      LAB      B201     B201
Tue      B201     B201     B201     B201     B201     B201
Wed      B201     B201     B201     B201     B201     B201
Thu      B201     B201     B201     LAB      LAB      LAB
Fri      B201     B201     B201     B201     B201     B201

SECOND SEM - C2B
Day      P1       P2       P3       P4       P5       P6
Mon      B202     CCFLAB   CCFLAB   B202     B202     B202
Tue      B202     B202     B202     B202     ITLAB    ITLAB
Wed      B202     B202     B202     B202     B202     B202
Thu      B202     B202     B202     B202     B202     B202
Fri      B202     B202     B202     B202     B202     B202
  `;

  console.log("\n========================================");
  console.log("  Testing parseTimetable Function");
  console.log("========================================\n");

  try {
    console.log("📋 Input Timetable:");
    console.log(sampleTimetable);
    
    console.log("\n⏳ Calling parseTimetable...\n");
    const result = await parseTimetable(sampleTimetable);
    
    console.log("✅ Parse Result:");
    console.log(JSON.stringify(result, null, 2));
    
    if (Array.isArray(result) && result.length > 0) {
      console.log(`\n📊 Found ${result.length} lab session(s):`);
      result.forEach((session, idx) => {
        console.log(`\n${idx + 1}. ${session.batch} - ${session.day}`);
        console.log(`   Time: ${session.time}`);
        console.log(`   Classroom: ${session.classroom}`);
        console.log(`   Lab: ${session.lab_location}`);
      });
    } else {
      console.log("\n⚠️  No lab sessions detected");
    }
  } catch (error) {
    console.error("❌ Test Error:", error.message);
  }

  console.log("\n========================================\n");
}

// Run test if file is executed directly
if (require.main === module) {
  test().catch(console.error);
}

module.exports = { parseTimetable };