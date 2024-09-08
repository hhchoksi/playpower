import Groq from "groq-sdk";

const groq = new Groq({ apiKey: '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' });

export const generateText = async (prompt, options = {}) => {
  const { model = "llama3-8b-8192" } = options;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: model,
    });

    return completion.choices[0].message.content;
  } 
  catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text");
  }
};