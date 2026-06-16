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
                You are a strict, non-creative fashion assistant extraction engineer.
                Analyze the following properties and use your googleSearch tool on the URL (only if provided) to find product specifications to write a cohesive 3-4 sentence summary for this item:
                - Brand: ${brand || 'Unknown'}
                - Item Category/Description: ${description || 'Clothing item'}
                - Reference URL: ${checkedUrl}
                - User Notes: ${notes || 'None'}

                STRICT ENTRY RULES and DATA EXTRACTION GUIDELINES :
                1. Look for raw dimensions and materials which might be hidden in unstructured text strings, tables, or item dropdown lists (e.g., Look for patterns like W x H, H x W, "cm", "inches", "Measurements", or "Size Guide").
                2. If you find a layout table or matrix of sizing metrics, map out the numeric values carefully to identify which numbers correspond to "Width", "Height", "Length", or "Strap Drop".
                3. ZERO HALLUCINATIONS: Do NOT make up, assume, or guess any fabrics or measurements if the notes or url do not mention a fabric.
                4. If they are completely missing or unverified, state exactly this phrase: "Specific material and measurement specs are currently unverified." Do not guess or approximate values.
                5. If possible, discuss how to style it and during what occasion.
                6. Return ONLY the final description paragraph text. Do not include introductory notes.
            `.trim();

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
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