// Placeholder for Gemini API Key - In production, use ENV variables
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function categorizeTransaction(
  merchant: string,
  body: string
): Promise<string> {
  try {
    const prompt = `Categorize this transaction into one word (e.g., Food, Transport, Shopping, Bills, Salary, Transfer): Merchant: ${merchant}, Body: ${body}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    return "Uncategorized";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Uncategorized";
  }
}
