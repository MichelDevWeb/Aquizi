import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { db } from "@/lib/firebase/firebase-config";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy
} from "firebase/firestore";
import { COLLECTIONS, FIELDS } from "@/lib/firestore/firestore-config";
import { v4 as uuidv4 } from "uuid";

// Define the vocabulary interface
interface VocabularyWord {
  id: string;
  word: string;
  definition: string;
  example: string;
  pronunciation: string;
  vietnameseTranslation: string;
  difficulty: string;
  audioUrl?: string | null;
  synonyms?: string[];
  antonyms?: string[];
  usageNotes?: string;
  partOfSpeech?: string;
  createdAt?: any;
  [key: string]: any; // Allow for additional properties
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const difficultyParam = url.searchParams.get("difficulty");
    const count = parseInt(url.searchParams.get("count") || "5", 10);
    const userId = url.searchParams.get("userId");
    
    // Check if we should get from cache first
    const useCache = url.searchParams.get("useCache") !== "false";
    
    // Array to store the final vocabulary words
    let finalVocabulary: VocabularyWord[] = [];
    
    if (useCache && userId) {
      // Get words the user has seen before (both correct and incorrect)
      const scoresCollection = collection(db, COLLECTIONS.VOCABULARY_SCORES);
      const scoresQuery = query(
        scoresCollection,
        where(FIELDS.VOCABULARY_SCORE.USER_ID, "==", userId)
      );
      
      const scoresSnapshot = await getDocs(scoresQuery);
      
      // Collect all words the user has seen
      const seenWords: Set<string> = new Set();
      
      scoresSnapshot.forEach((doc) => {
        const data = doc.data();
        const correctWords: string[] = data[FIELDS.VOCABULARY_SCORE.WORDS_CORRECT] || [];
        const incorrectWords: string[] = data[FIELDS.VOCABULARY_SCORE.WORDS_INCORRECT] || [];
        
        // Add all words to the set
        correctWords.forEach(word => seenWords.add(word.toLowerCase()));
        incorrectWords.forEach(word => seenWords.add(word.toLowerCase()));
      });
      
      // Get vocabulary from Firestore that the user hasn't seen before
      const vocabularyCollection = collection(db, COLLECTIONS.VOCABULARY);
      let vocabularyQuery;
      
      if (difficultyParam && difficultyParam !== "all") {
        vocabularyQuery = query(
          vocabularyCollection,
          where(FIELDS.VOCABULARY.DIFFICULTY, "==", difficultyParam),
          orderBy(FIELDS.VOCABULARY.CREATED_AT, "desc"),
          limit(count * 2) // Get more than needed to filter out seen words
        );
      } else {
        vocabularyQuery = query(
          vocabularyCollection,
          orderBy(FIELDS.VOCABULARY.CREATED_AT, "desc"),
          limit(count * 2) // Get more than needed to filter out seen words
        );
      }
      
      const querySnapshot = await getDocs(vocabularyQuery);
      
      if (!querySnapshot.empty) {
        const cachedVocabulary: VocabularyWord[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const word = data[FIELDS.VOCABULARY.WORD] || "";
          
          // Only add words the user hasn't seen before
          if (!seenWords.has(word.toLowerCase())) {
            cachedVocabulary.push({
              id: doc.id,
              word: word,
              definition: data[FIELDS.VOCABULARY.DEFINITION] || "",
              example: data[FIELDS.VOCABULARY.EXAMPLE] || "",
              pronunciation: data[FIELDS.VOCABULARY.PRONUNCIATION] || "",
              vietnameseTranslation: data[FIELDS.VOCABULARY.VIETNAMESE_TRANSLATION] || "",
              difficulty: data[FIELDS.VOCABULARY.DIFFICULTY] || "beginner",
              audioUrl: data[FIELDS.VOCABULARY.AUDIO_URL],
              synonyms: data.synonyms || [],
              antonyms: data.antonyms || [],
              usageNotes: data.usageNotes || "",
              partOfSpeech: data.partOfSpeech || "",
              createdAt: data[FIELDS.VOCABULARY.CREATED_AT],
            });
          }
        });
        
        // Take only the required number of words
        finalVocabulary = cachedVocabulary.slice(0, count);
      }
    } else if (useCache) {
      // If no userId provided, just get random words from cache
      const vocabularyCollection = collection(db, COLLECTIONS.VOCABULARY);
      let vocabularyQuery = query(
        vocabularyCollection, 
        orderBy(FIELDS.VOCABULARY.CREATED_AT, "desc"),
        limit(count)
      );
      
      // Add difficulty filter if provided
      if (difficultyParam && difficultyParam !== "all") {
        vocabularyQuery = query(
          vocabularyCollection, 
          where(FIELDS.VOCABULARY.DIFFICULTY, "==", difficultyParam),
          orderBy(FIELDS.VOCABULARY.CREATED_AT, "desc"),
          limit(count)
        );
      }
      
      const querySnapshot = await getDocs(vocabularyQuery);
      
      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          finalVocabulary.push({
            id: doc.id,
            word: data[FIELDS.VOCABULARY.WORD] || "",
            definition: data[FIELDS.VOCABULARY.DEFINITION] || "",
            example: data[FIELDS.VOCABULARY.EXAMPLE] || "",
            pronunciation: data[FIELDS.VOCABULARY.PRONUNCIATION] || "",
            vietnameseTranslation: data[FIELDS.VOCABULARY.VIETNAMESE_TRANSLATION] || "",
            difficulty: data[FIELDS.VOCABULARY.DIFFICULTY] || "beginner",
            audioUrl: data[FIELDS.VOCABULARY.AUDIO_URL],
            synonyms: data.synonyms || [],
            antonyms: data.antonyms || [],
            usageNotes: data.usageNotes || "",
            partOfSpeech: data.partOfSpeech || "",
            createdAt: data[FIELDS.VOCABULARY.CREATED_AT],
          });
        });
      }
    }
    
    // If we have enough words from cache, return them
    if (finalVocabulary.length >= count) {
      return NextResponse.json({ 
        vocabulary: finalVocabulary.slice(0, count), 
        source: "cache" 
      }, { status: 200 });
    }
    
    // If we don't have enough words or cache is disabled, generate new vocabulary
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not provided" },
        { status: 500 }
      );
    }

    // Calculate how many more words we need to generate
    const wordsToGenerate = count - finalVocabulary.length;

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.GPT_MODEL || "gpt-4o-mini",
    });

    const parser = new JsonOutputFunctionsParser();
    const extractionFunctionSchema = {
      name: "extractor",
      description: "Extracts vocabulary data from the output",
      parameters: {
        type: "object",
        properties: {
          vocabulary: {
            type: "array",
            items: {
              type: "object",
              properties: {
                word: { type: "string" },
                definition: { type: "string" },
                example: { type: "string" },
                pronunciation: { type: "string" },
                vietnameseTranslation: { type: "string" },
                difficulty: { 
                  type: "string",
                  enum: ["beginner", "intermediate", "advanced"]
                },
                synonyms: {
                  type: "array",
                  items: { type: "string" }
                },
                antonyms: {
                  type: "array",
                  items: { type: "string" }
                },
                usageNotes: { type: "string" },
                partOfSpeech: { type: "string" },
              },
              required: ["word", "definition", "example", "pronunciation", "vietnameseTranslation", "difficulty", "synonyms", "antonyms", "partOfSpeech"]
            },
          },
        },
        required: ["vocabulary"]
      },
    };

    const runnable = model
      .bind({
        functions: [extractionFunctionSchema],
        function_call: { name: "extractor" },
      })
      .pipe(parser);

    const difficultyFilter = difficultyParam ? `Focus on ${difficultyParam} level words.` : "Include a mix of difficulty levels.";
    
    const prompt = `Generate ${wordsToGenerate} English vocabulary words for Vietnamese students to learn. 
    For each word, provide:
    1. The word itself
    2. A clear definition
    3. An example sentence using the word
    4. Pronunciation guide
    5. Vietnamese translation
    6. Difficulty level (beginner, intermediate, or advanced)
    7. 2-3 synonyms
    8. 2-3 antonyms (if applicable)
    9. Brief usage notes or common collocations
    10. Part of speech (noun, verb, adjective, etc.)
    
    IMPORTANT: For the example sentences, DO NOT include the actual vocabulary word itself. 
    Instead, use a blank space or underline (___) where the word would normally appear.
    This is to help students practice filling in the correct word.
    
    Choose words that would be useful for Vietnamese students learning English.
    ${difficultyFilter}`;

    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: prompt,
        },
      ],
    });

    const result: any = await runnable.invoke([message]);
    
    // Save vocabulary to Firestore
    const vocabularyCollection = collection(db, COLLECTIONS.VOCABULARY);
    const generatedVocabulary: VocabularyWord[] = [];
    
    for (const word of result.vocabulary) {
      const docRef = await addDoc(vocabularyCollection, {
        [FIELDS.VOCABULARY.ID]: uuidv4(),
        [FIELDS.VOCABULARY.WORD]: word.word,
        [FIELDS.VOCABULARY.DEFINITION]: word.definition,
        [FIELDS.VOCABULARY.EXAMPLE]: word.example,
        [FIELDS.VOCABULARY.PRONUNCIATION]: word.pronunciation,
        [FIELDS.VOCABULARY.VIETNAMESE_TRANSLATION]: word.vietnameseTranslation,
        [FIELDS.VOCABULARY.DIFFICULTY]: word.difficulty,
        [FIELDS.VOCABULARY.CREATED_AT]: serverTimestamp(),
        [FIELDS.VOCABULARY.AUDIO_URL]: null, // Will be updated later with text-to-speech
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        usageNotes: word.usageNotes || "",
        partOfSpeech: word.partOfSpeech || "",
      });
      
      generatedVocabulary.push({
        id: docRef.id,
        word: word.word,
        definition: word.definition,
        example: word.example,
        pronunciation: word.pronunciation,
        vietnameseTranslation: word.vietnameseTranslation,
        difficulty: word.difficulty,
        synonyms: word.synonyms || [],
        antonyms: word.antonyms || [],
        usageNotes: word.usageNotes || "",
        partOfSpeech: word.partOfSpeech || "",
        audioUrl: null,
      });
    }

    // Combine cached and generated vocabulary
    const combinedVocabulary = [...finalVocabulary, ...generatedVocabulary];
    
    return NextResponse.json({ 
      vocabulary: combinedVocabulary, 
      source: finalVocabulary.length > 0 ? "mixed" : "generated" 
    }, { status: 200 });
  } catch (e: any) {
    console.error("Error generating vocabulary:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}