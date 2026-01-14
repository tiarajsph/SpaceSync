const { db } = require('../config/firebase');
const { parseTimetable } = require('../ai/testGemini');

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');

/* -----------------------------------------------------
   PDF TEXT EXTRACTION (PDF.js)
----------------------------------------------------- */
async function extractTextFromPDF(buffer) {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true
  });
  
  const pdf = await loadingTask.promise;
  let text = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it => it.str).join(' ') + '\n';
  }
  return text;
}

/* -----------------------------------------------------
   DYNAMIC NORMALIZATION
----------------------------------------------------- */
function normalizeTimetableText(rawText) {
  // Don't over-process - just clean up whitespace and preserve structure
  const cleanText = rawText.replace(/\s+/g, ' ').trim();
  return cleanText;
}

/* -----------------------------------------------------
   UPLOAD HANDLER
----------------------------------------------------- */
exports.uploadAndParseTimetable = async (req, res) => {
  try {
    const file = req.file || (Array.isArray(req.files) && req.files[0]);
    if (!file?.buffer) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const rawText = await extractTextFromPDF(file.buffer);
    const normalizedText = normalizeTimetableText(rawText);

    if (!normalizedText) {
      return res.status(400).json({ message: 'No valid timetable data found' });
    }

    console.log('Debug - Normalized Text:', normalizedText.substring(0, 500));

    // Call the AI parser function
    const parsed = await parseTimetable(normalizedText);

    console.log('Debug - Parsed Result:', parsed);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return res.status(422).json({ 
        message: 'No lab sessions detected',
        debug: { textLength: normalizedText.length }
      });
    }

    const firestoreBatch = db.batch();
    const ref = db.collection('lab_windows');

    parsed.forEach(item => {
      const id = `${item.batch}_${item.day}_${item.time}`
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_');

      firestoreBatch.set(ref.doc(id), {
        batch: item.batch,
        day: item.day,
        time: item.time,
        room_id: item.classroom,
        lab_location: item.lab_location,
        updated_at: new Date()
      }, { merge: true });
    });

    await firestoreBatch.commit();
    res.json({ message: 'Success', count: parsed.length, data: parsed });

  } catch (err) {
    console.error('Upload Process Failed:', err);
    res.status(500).json({ error: err.message });
  }
};
