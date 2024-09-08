import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: "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",
});

export const generateText = async (prompt, options = {}) => {
  const { model = "llama3-8b-8192" } = options;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
    });

    const aiResponse = completion.choices[0].message.content;
    try {
      const jsonStart = aiResponse.indexOf("[");
      const jsonEnd = aiResponse.lastIndexOf("]") + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = aiResponse.substring(jsonStart, jsonEnd);
        console.log("Extracted JSON:", jsonString);
        return JSON.parse(jsonString);
      }
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }

    throw new Error("Failed to extract valid JSON from AI response");
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text");
  }
};
