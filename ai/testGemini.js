import dotenv from "dotenv";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

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
      time: { type: SchemaType.STRING },
      classroom: { type: SchemaType.STRING },
      lab_location: { type: SchemaType.STRING },
    },
    required: ["batch", "time", "classroom", "lab_location"],
  },
};

// 3. Initialize model with JSON Response MIME type
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // Updated to the version available to you
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: schema,
  },
});

export async function parseTimetable(timetableText) {
 const prompt = `
You are given a college timetable and a fixed classroom mapping.

IMPORTANT:
Each batch has a PERMANENT classroom:
S4 CSE A = B201
S4 CSE B = B202
S4 CSE C = B203
S4 CSE D = B204

If a batch is in a LAB, that means:
- Their normal classroom is EMPTY
- You MUST use the PERMANENT classroom value
- DO NOT write "LAB" as classroom

Task:
Return only batches currently in LAB.

Return JSON strictly in this format:
[
  {
    "batch": "",
    "time": "",
    "classroom": "",   // use PERMANENT classroom
    "lab_location": ""
  }
]

Timetable:
${timetableText}
`;


  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // With responseMimeType, we are guaranteed valid JSON
    return JSON.parse(text); 
  } catch (error) {
    console.error("Failed to parse timetable:", error.message);
    return []; // Return empty array on failure to prevent code crash
  }
}

async function test() {
  const sample = `
    S4 CSE A - 2:00-5:00 - LAB - CS Lab 2
    S4 CSE B - 2:00-3:00 - B202
    S4 CSE C - 2:00-5:00 - LAB - IT Lab
    S4 CSE D - 3:00-4:00 - B204
  `;

  console.log("--- Extracting Lab Schedules ---");
  const data = await parseTimetable(sample);
  console.table(data); // Use table for cleaner console output
}

test();