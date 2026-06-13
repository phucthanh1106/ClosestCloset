import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';


dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
    async generateItemContent({ brand, notes, url, description }) {
        try { 
            const prompt = `
                You are a fashion assistant for a personal digital wardrobe app.
                Write a concise, short and cohesive summarization (3-4 sentences) for a clothing item based on the following raw details:
                
                - Description: ${description || 'Clothing Item'}
                - Source/URL: ${url || 'No URL'}
                - Brand: ${brand || 'Unspecified Brand'}
                - User Notes: ${notes || 'No notes provided.'}

                Rules:
                1. Write it naturally from the perspective of a fashion/clothing encyclopaedia/wikipedia.
                2. Include style, vibe, materials, what occasion to wear this.
                3. Look up materials and measurements of this item online (or from the url) and include that information.
                4. Write something about how the user intends to use it based on their notes (if notes are provided). 
                5. Do NOT invent fake specifications or any information (like fabric percentages or measurements) if they aren't provided.
                6. Return ONLY the description paragraph. Do not include any intro like "Here is your description:".
            `.trim();

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const content = response.text?.trim();

            if (!content) {
                throw new Error('Gemini returned an empty description handler payload');
            } 

            return content
        } catch (error) {
            console.error('Error generating description from Gemini API:', error);
            throw error;
        }
    } 
}