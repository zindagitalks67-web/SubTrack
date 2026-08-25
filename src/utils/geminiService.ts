const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateFinancialInsights(data: any): Promise<string> {
  if (!apiKey) {
    return "❌ API key missing. Add VITE_GEMINI_API_KEY in .env.local";
  }

  try {
    const prompt = `Analyze this finance data: ${JSON.stringify(data)}. Give 3 smart money-saving insights in simple English.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      const errorData = result?.error || {};
      const errorMessage = errorData?.message || `HTTP ${response.status}`;
      
      // ✅ Agar quota exceed hua hai (429)
      if (response.status === 429 || errorMessage.includes("quota")) {
        return "⏳ Google Gemini free limit cross ho gayi! 20 second wait karke dobara try karo.";
      }
      
      // ✅ Agar model issue hai (404)
      if (response.status === 404 || errorMessage.includes("NOT_FOUND")) {
        return "❌ Model not found! Code mein gemini-3.6-flash use karo.";
      }

      return `❌ Error: ${errorMessage}`;
    }

    return result?.candidates?.[0]?.content?.parts?.[0]?.text || "No insights generated.";
  } catch (error: any) {
    console.error("Network Error:", error);
    return `❌ Network Error: ${error.message || "Unknown error"}`;
  }
}