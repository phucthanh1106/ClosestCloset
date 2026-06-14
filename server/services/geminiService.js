import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';


dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
    async generateItemContent({ brand, notes, url, description }) {
        try { 
            const checkedUrl = (url && url.trim() !== "" && url !== "undefined") 
                ? `Purchased/found at: ${url}` 
                : "No source URL provided.";
            
            const prompt = `
                You are a strict, non-creative fashion assistant for a digital wardrobe app.
                Analyze the following clothing item properties to Write a cohesive, natural 3-4 sentence summary for this item:
                - Brand: ${brand || 'Unknown'}
                - Item Category/Description: ${description || 'Clothing item'}
                - Reference URL: ${checkedUrl}
                - User Notes: ${notes || 'None'}

                STRICT ENTRY RULES:
                1. FIRST PRIORITY: Use your search tool to analyze the Reference URL if provided to gather real-world specifications like the fabrics, measurements, style, silhouette of the piece.
                2. ZERO HALLUCINATIONS: Do NOT make up, assume, or guess any fabrics or measurements if the notes or url do not mention a fabric.
                3. If they are completely missing or unverified, state exactly this phrase: "Specific material and measurement specs are currently unverified." Do not guess or approximate values.
                4. State target styling ideas or occasions based on the User Notes.
                5. Return ONLY the final description paragraph text. Do not include introductory notes.
            `.trim();

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite',
                contents: prompt,
                config: {
                    tools: [
                        { 
                            googleSearch: {} 
                        }
                    ] 
                }
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