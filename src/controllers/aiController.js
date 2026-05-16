import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const askAI = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Question is required"
            });
        }
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });

        const result = await model.generateContent(question);

        const response = await result.response;
        const text = response.text();

        res.json({
            answer: text
        });

    } catch (error) {
        console.log(error);

        res.json({
            answer: "AI service is currently limited. Try again later. General advice: focus on protein, water, sleep, and consistent training."
        });
    }
};