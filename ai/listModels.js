import 'dotenv/config';

async function listModels() {
  const apiKey = process.env.API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error("API Error:", data.error.message);
      return;
    }

    console.log("--- Models You Can Use ---");
    data.models.forEach(model => {
      // Only show models that support text generation
      if (model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`> ${model.name.replace('models/', '')}`);
      }
    });
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

listModels();