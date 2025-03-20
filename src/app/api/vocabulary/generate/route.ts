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
    
    // Initialize seenWords set to track words the user has seen
    const seenWords: Set<string> = new Set();
    
    // Step 1: If we have a userId, get the words they've already seen
    if (userId) {
      const scoresCollection = collection(db, COLLECTIONS.VOCABULARY_SCORES);
      const scoresQuery = query(
        scoresCollection,
        where(FIELDS.VOCABULARY_SCORE.USER_ID, "==", userId)
      );
      
      const scoresSnapshot = await getDocs(scoresQuery);
      
      scoresSnapshot.forEach((doc) => {
        const data = doc.data();
        const correctWords: string[] = data[FIELDS.VOCABULARY_SCORE.WORDS_CORRECT] || [];
        const incorrectWords: string[] = data[FIELDS.VOCABULARY_SCORE.WORDS_INCORRECT] || [];
        
        // Add all words to the set
        correctWords.forEach(word => seenWords.add(word.toLowerCase()));
        incorrectWords.forEach(word => seenWords.add(word.toLowerCase()));
      });
    }
    
    // Step 2: For 'Play Again' scenario (useCache=false), return words immediately
    if (!useCache && userId && seenWords.size > 0) {
      // Prepare query to get words the user has seen before
      const vocabularyCollection = collection(db, COLLECTIONS.VOCABULARY);
      const wordsList = Array.from(seenWords).slice(0, count * 2);
      
      // Get a subset of previously seen words
      const cachedVocabulary: VocabularyWord[] = [];
      
      // Use batch processing to get words efficiently
      // We'll process in chunks of 10 words to avoid query limitations
      const chunkSize = 10;
      for (let i = 0; i < wordsList.length; i += chunkSize) {
        const chunk = wordsList.slice(i, i + chunkSize);
        
        let vocabularyQuery;
        if (difficultyParam && difficultyParam !== "all") {
          vocabularyQuery = query(
            vocabularyCollection,
            where(FIELDS.VOCABULARY.WORD, "in", chunk),
            where(FIELDS.VOCABULARY.DIFFICULTY, "==", difficultyParam),
            limit(chunkSize)
          );
        } else {
          vocabularyQuery = query(
            vocabularyCollection,
            where(FIELDS.VOCABULARY.WORD, "in", chunk),
            limit(chunkSize)
          );
        }
        
        const querySnapshot = await getDocs(vocabularyQuery);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          cachedVocabulary.push({
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
        
        if (cachedVocabulary.length >= count) break;
      }
      
      if (cachedVocabulary.length > 0) {
        return NextResponse.json({ 
          vocabulary: cachedVocabulary.slice(0, count), 
          source: "played_before" 
        }, { status: 200 });
      }
    }
    
    // Step 3: Try to find unused vocabulary based on the user's history and difficulty
    if (useCache) {
      const vocabularyCollection = collection(db, COLLECTIONS.VOCABULARY);
      let vocabularyQuery;
      
      if (difficultyParam && difficultyParam !== "all") {
        vocabularyQuery = query(
          vocabularyCollection,
          where(FIELDS.VOCABULARY.DIFFICULTY, "==", difficultyParam),
          orderBy(FIELDS.VOCABULARY.CREATED_AT, "desc"),
          limit(count * 3) // Get more than needed to filter out seen words
        );
      } else {
        vocabularyQuery = query(
          vocabularyCollection,
          orderBy(FIELDS.VOCABULARY.CREATED_AT, "desc"),
          limit(count * 3) // Get more than needed to filter out seen words
        );
      }
      
      const querySnapshot = await getDocs(vocabularyQuery);
      
      if (!querySnapshot.empty) {
        const cachedVocabulary: VocabularyWord[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const word = data[FIELDS.VOCABULARY.WORD] || "";
          
          // For users with ID, only add words they haven't seen
          // For users without ID, add all words
          if (!userId || !seenWords.has(word.toLowerCase())) {
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
      
      // If we don't have enough words, try a broader search
      if (finalVocabulary.length < count) {
        // Prepare a wider query to find more unused words
        let expandedQuery;
        
        if (difficultyParam && difficultyParam !== "all") {
          expandedQuery = query(
            vocabularyCollection,
            where(FIELDS.VOCABULARY.DIFFICULTY, "==", difficultyParam),
            limit(200) // A much larger limit to find all available words
          );
        } else {
          expandedQuery = query(
            vocabularyCollection,
            limit(200) // A much larger limit to find all available words
          );
        }
        
        const expandedSnapshot = await getDocs(expandedQuery);
        
        if (!expandedSnapshot.empty) {
          // Keep track of words we already have to avoid duplicates
          const currentWords = new Set(finalVocabulary.map(v => v.word.toLowerCase()));
          
          expandedSnapshot.forEach((doc) => {
            const data = doc.data();
            const word = data[FIELDS.VOCABULARY.WORD] || "";
            
            // Only add new words that aren't in our current list and haven't been seen by user
            if (!currentWords.has(word.toLowerCase()) && 
                (!userId || !seenWords.has(word.toLowerCase()))) {
              if (finalVocabulary.length < count) {
                finalVocabulary.push({
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
                currentWords.add(word.toLowerCase());
              }
            }
          });
        }
      }
    }
    
    // If we have enough words from cache/database, return them
    if (finalVocabulary.length >= count) {
      return NextResponse.json({ 
        vocabulary: finalVocabulary.slice(0, count), 
        source: "database" 
      }, { status: 200 });
    }
    
    // Step 4: Only if we still don't have enough words, generate new ones
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