import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX_NAME);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const vectorService = {
  /**
   * Upsert a cloth item card into its owner's specific Pinecone namespace.
   * @param {Object} item - The saved ItemCards document instance from MongoDB
   */
  async upsertItemCard(item) {
    try {
        const semanticText = [
            item.brand ? `Brand: ${item.brand}.` : '',
            item.description ? `Description: ${item.description}.` : '',
            item.notes ? `User notes: ${item.notes}.` : '',
            item.url ? `Link to the product: ${item.url}` : '',
            item.geminiDescription ? `Summarization about ${item.description}: ${item.geminiDescription}` : ''
        ].filter(Boolean).join(' ');

        if (!semanticText) return; // Skip if there's no text data to embed

        // Step B: Generate the vector array embedding via Gemini
        const embeddingResponse = await ai.models.embedContent({
            model: 'gemini-embedding-2',
            contents: semanticText,
            config: {
                outputDimensionality: 512 // 💡 CRITICAL: Matches your Pinecone Index settings perfectly
            }
        });

        const vectorValues = embeddingResponse.embeddings[0].values;
        // console.log(vectorValues)
        
        if (!vectorValues) {
            throw new Error('Failed to extract vector array from Gemini response');
        }

        // Attach metadata
        const metadataTag = {
            text: semanticText,
        }

        // Step C: Securely isolate inside the Pinecone Namespace using item.userId
        await index.namespace(item.userId.toString()).upsert({
            records: [
                {
                    id: item._id.toString(), // Store MongoDB ID as the Vector ID for clean matching
                    values: vectorValues,
                    metadata: metadataTag
                }
            ]
        });

        console.log(`Successfully indexed item card ${item._id} inside namespace: ${item.userId}`);
        return true;
    } catch (error) {
        console.error(`Error syncing ItemCard to Pinecone:`, error);
        throw error;
    }
  },

  /**
   * Delete item vector from a user's isolated namespace wall
   */
  async deleteItemCard(userId, itemId) {
    try {
        await index.namespace(userId).deleteOne({ id: itemId.toString() });
        console.log(`Removed item vector ${itemId} from namespace: ${userId}`);
    } catch (error) {
        console.error(`Error deleting item vector from Pinecone:`, error);
    }
  }
};