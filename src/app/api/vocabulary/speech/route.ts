import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/firebase/firebase-config";
import { doc, updateDoc } from "firebase/firestore";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";

export async function POST(req: NextRequest) {
  try {
    const { word, documentId } = await req.json();

    if (!word) {
      return NextResponse.json(
        { error: "Word is required" },
        { status: 400 }
      );
    }

    // Google Translate TTS URL
    // This uses the unofficial Google Translate API which is free but not officially supported
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(word)}&tl=en&client=tw-ob`;
    
    // Fetch the audio file
    const response = await axios.get(googleTtsUrl, {
      responseType: 'arraybuffer'
    });
    
    // Convert the audio to a base64 string
    const buffer = Buffer.from(response.data);
    const base64Audio = buffer.toString("base64");
    
    // Create a data URL for the audio
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    
    // Update the document in Firestore with the audio URL
    if (documentId) {
      const docRef = doc(db, COLLECTIONS.VOCABULARY, documentId);
      await updateDoc(docRef, {
        [FIELDS.VOCABULARY.AUDIO_URL]: audioUrl,
      });
    }

    return NextResponse.json({ audioUrl }, { status: 200 });
  } catch (e: any) {
    console.error("Error generating speech:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 