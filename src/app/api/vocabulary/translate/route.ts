import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang = "vi" } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Google Translate API URL (unofficial)
    // This uses the unofficial Google Translate API which is free but not officially supported
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    // Fetch the translation
    const response = await axios.get(url);
    
    // Parse the response
    // The response format is a nested array where the first element contains translation segments
    const translationSegments = response.data[0];
    let translatedText = "";
    
    // Concatenate all translation segments
    if (translationSegments && Array.isArray(translationSegments)) {
      translatedText = translationSegments
        .map((segment: any) => segment[0])
        .join("");
    }

    return NextResponse.json({ translatedText }, { status: 200 });
  } catch (e: any) {
    console.error("Error translating text:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 