
import { GoogleGenAI, Type } from "@google/genai";
import type { Track } from '../types';

export const generatePlaylist = async (prompt: string): Promise<Track[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a playlist of 8 fictional songs for the mood: "${prompt}". Provide unique, creative titles, artist names, and durations (MM:SS format). For each song, also provide a URL for a placeholder album art image from picsum.photos with size 200x200.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The creative title of the song."
              },
              artist: {
                type: Type.STRING,
                description: "The fictional artist's name."
              },
              albumArt: {
                type: Type.STRING,
                description: "A URL from picsum.photos for album art (200x200)."
              },
              duration: {
                type: Type.STRING,
                description: "The duration of the song in MM:SS format."
              }
            },
            required: ["title", "artist", "albumArt", "duration"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const playlist = JSON.parse(jsonText);
    return playlist as Track[];
  } catch (error) {
    console.error("Error generating playlist with Gemini:", error);
    throw new Error("Failed to parse playlist from Gemini response.");
  }
};