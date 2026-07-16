import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Create an AI model using your gemini api key
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
    async generateItemContent({ file, brand, notes, url, description }) {
        try { 
            const checkedUrl = (url && url.trim() !== "" && url !== "undefined") 
                ? `Purchased/found at: ${url}` 
                : "No source URL provided.";

            // Download the existing item image from Firebase.
            const imageResponse = await fetch(file);

            if (!imageResponse.ok) {
                throw new Error("Could not fetch the item image");
            }

            // Convert the image into a format Gemini accepts.
            const imageBuffer = await imageResponse.arrayBuffer();

            // Once your image is in an imageBuffer, you can easily translate it into whatever format:
            // Base64, saved directly as a file,...
            const imageBase64 = Buffer.from(imageBuffer).toString("base64");

            const imageMimeType = imageResponse.headers.get("content-type") || "image/jpeg";




            const prompt = `
                You are a fashion assistant.
                Analyze the following properties and the provided image use your googleSearch tool on the URL (only if provided) to find product specifications to write a cohesive 4-5 sentences summary for this item:
                
                - Brand: ${brand || 'Unknown'}
                - Item Category/Description: ${description || 'Clothing item'}
                - Reference URL: ${checkedUrl}
                - User Notes: ${notes || 'None'}

                STRICT ENTRY RULES and DATA EXTRACTION GUIDELINES :
                1. Look for raw dimensions and materials which might be hidden in unstructured text strings, tables, or item dropdown lists (e.g., Look for patterns like W x H, H x W, "cm", "inches", "Measurements", or "Size Guide").
                2. Look for price of the item either through the url if provided or look it up online using your search tool.
                3. If you find a layout table or matrix of sizing metrics, map out the numeric values carefully to identify which numbers correspond to "Width", "Height", "Length", or "Strap Drop".
                4. ZERO HALLUCINATIONS: Do NOT make up, assume, or guess any information if the notes or url do not mention that information.
                5. If they are completely missing or unverified, state exactly this phrase: "I can't find the information that you are looking for." Do not guess or approximate values.
                6. Describe visible details from the image, including color, pattern, shape, style, pockets, straps, and hardware.
                7. Return ONLY the final description paragraph text. Do not include introductory notes.
            `.trim();

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        inlineData: {
                            mimeType: imageMimeType,
                            data: imageBase64
                        }
                    },
                    {
                        text: prompt
                    }
                ],
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