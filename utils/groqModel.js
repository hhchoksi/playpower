import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateText = async (prompt, options = {}) => {
    const {
        model = 'mixtral-8x7b-32768',
        maxTokens = 100,
        temperature = 0.7
    } = options;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: model,
            max_tokens: maxTokens,
            temperature: temperature,
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error generating text:', error);
        throw new Error('Failed to generate text');
    }
};