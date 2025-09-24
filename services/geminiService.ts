import { GoogleGenAI, Chat, Content, Part } from "@google/genai";

let ai: GoogleGenAI | null = null;
const model = 'gemini-2.5-flash';

/**
 * Initializes the GoogleGenAI instance with the provided API key.
 * If the key is empty, the instance is cleared.
 * @param apiKey The Google Gemini API key.
 */
export function initialize(apiKey: string) {
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    } else {
        ai = null; // Clear instance if API key is removed
    }
}

/**
 * Checks if the Gemini AI service has been initialized with an API key.
 * @returns True if initialized, false otherwise.
 */
export function isInitialized(): boolean {
    return ai !== null;
}

// Store chats and their system instructions in a map to maintain conversation history per session
const chats = new Map<string, { chat: Chat; systemInstruction?: string }>();

function getChat(sessionId: string, history: Content[], systemInstruction?: string): Chat {
    if (!ai) {
        // This should theoretically not be reached if isInitialized() is checked before calling,
        // but it's a good safeguard.
        throw new Error("Gemini AI not initialized.");
    }

    const existingSession = chats.get(sessionId);

    // FIX: Recreate chat if systemInstruction changes, as chat.config is private and can't be updated.
    // If a session doesn't exist or its system instruction has changed, create a new one.
    if (!existingSession || existingSession.systemInstruction !== systemInstruction) {
        const chat = ai.chats.create({
            model: model,
            history: history,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        chats.set(sessionId, { chat, systemInstruction });
        return chat;
    }
    
    return existingSession.chat;
}

/**
 * Clears a chat session from the memory cache.
 * This is useful when starting a new chat or deleting one.
 * @param sessionId The ID of the session to clear.
 */
export function clearChatSession(sessionId: string) {
    if (chats.has(sessionId)) {
        chats.delete(sessionId);
    }
}


/**
 * Generates a chat response as a stream.
 * @param sessionId The unique ID for the conversation session.
 * @param message The user's message.
 * @param history The previous conversation history.
 * @param systemInstruction The system instruction for the AI.
 * @param file Optional file to include in the message.
 * @returns An async generator that yields response chunks.
 */
export async function* getChatResponseStream(
    sessionId: string,
    message: string,
    history: Content[],
    systemInstruction: string,
    file?: { data: string; type: string }
): AsyncGenerator<string> {
    if (!ai) {
        throw new Error("Gemini AI not initialized. Please set your API key in settings.");
    }
    const chat = getChat(sessionId, history, systemInstruction);

    const parts: Part[] = [{ text: message }];

    if (file) {
        // Add the file part at the beginning
        parts.unshift({
            inlineData: {
                data: file.data,
                mimeType: file.type,
            },
        });
    }

    // FIX: The `sendMessageStream` method expects an object with a `message` property containing the parts array.
    const result = await chat.sendMessageStream({ message: parts });

    for await (const chunk of result) {
        // FIX: Access the text content directly from the chunk.
        yield chunk.text;
    }
}

/**
 * Summarizes a conversation into a short title.
 * @param conversation The conversation history to summarize.
 * @returns A promise that resolves to a short title string.
 */
export async function summarizeTitle(conversation: string): Promise<string> {
    if (!ai) {
        console.error("Cannot summarize title, Gemini AI not initialized.");
        return "Untitled Chat";
    }
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Summarize the following conversation into a short, concise title of no more than 5 words.
            Conversation:
            ---
            ${conversation}
            ---
            Title:`,
        });

        // FIX: Access the text content directly from the response.
        return response.text.trim().replace(/"/g, ''); // Clean up quotes
    } catch (error) {
        console.error("Error summarizing title:", error);
        return "Untitled Chat";
    }
}

/**
 * Tests if a given API key is valid by making a simple request.
 * This does NOT use the main 'ai' instance.
 * @param apiKey The API key to test.
 * @returns A promise that resolves to true if the key is valid, false otherwise.
 */
export async function testApiKey(apiKey: string): Promise<boolean> {
    if (!apiKey) {
        return false;
    }
    try {
        const testAi = new GoogleGenAI({ apiKey });
        await testAi.models.generateContent({
            model: model, // uses the same model 'gemini-2.5-flash'
            contents: 'Test',
        });
        return true;
    } catch (error) {
        console.error("API Key test failed:", error);
        return false;
    }
}