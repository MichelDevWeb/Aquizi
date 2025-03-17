import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Volume, ChevronRight, CheckCircle, XCircle, BookOpen, MessageSquare, Globe } from "lucide-react";
import { Vocabulary } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import confetti from 'canvas-confetti';
import { useLanguage } from "@/contexts/LanguageContext";

interface WordAnswerProps {
  currentWord: Vocabulary;
  answerStatus: 'correct' | 'incorrect' | null;
  nextWord: () => void;
  playAudio: (audioUrl: string) => void;
  generateSpeech: (word: string, documentId: string) => Promise<void>;
  formatExample: (example: string, word: string) => string | React.ReactNode;
  isLastWord: boolean;
}

export function WordAnswer({
  currentWord,
  answerStatus,
  nextWord,
  playAudio,
  generateSpeech,
  formatExample,
  isLastWord
}: WordAnswerProps) {
  const { t } = useLanguage();
  
  // Trigger confetti effect when answer is correct
  useEffect(() => {
    if (answerStatus === 'correct') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [answerStatus]);

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentWord.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "p-4 sm:p-5 rounded-lg transition-all shadow-lg border-2",
            answerStatus === 'correct' 
              ? "bg-gradient-to-br from-green-50 to-green-100/50 border-green-300 dark:from-green-900/30 dark:to-green-900/10 dark:border-green-800" 
              : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-300 dark:from-red-900/30 dark:to-red-900/10 dark:border-red-800"
          )}>
          <div className="flex items-center space-x-3 mb-3 sm:mb-4">
            {answerStatus === 'correct' ? (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 10 }}
                className="flex items-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-2 sm:p-2.5 rounded-full shadow-sm"
              >
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 10 }}
                className="flex items-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-2 sm:p-2.5 rounded-full shadow-sm"
              >
                <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.div>
            )}
            <div>
              <motion.h3 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-bold text-base sm:text-xl"
              >
                {answerStatus === 'correct' ? t('correct') : t('incorrect')}
              </motion.h3>
              <motion.p 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs sm:text-sm text-muted-foreground"
              >
                {answerStatus === 'correct' 
                  ? `${t('points')}: +10` 
                  : `${t('correct')}: ${currentWord.word}`}
              </motion.p>
            </div>
          </div>
          
          <div className="grid gap-3 sm:gap-4 mt-4">
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-background/90 p-3 sm:p-4 rounded-lg shadow-sm border border-muted hover:border-muted-foreground/20 transition-colors"
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-medium flex items-center gap-1.5 text-primary">
                  <BookOpen className="h-4 w-4" />
                  {t('word')}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        if (currentWord.audioUrl) {
                          playAudio(currentWord.audioUrl);
                        } else {
                          // If audio URL is not available, generate speech
                          generateSpeech(currentWord.word, currentWord.id);
                        }
                      }}
                    >
                      <Volume className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t('pronunciation')}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {currentWord.word}
              </p>
              {currentWord.pronunciation && (
                <p className="text-sm text-muted-foreground mt-1 font-mono">
                  {currentWord.pronunciation}
                </p>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-background/90 p-3 sm:p-4 rounded-lg shadow-sm border border-muted hover:border-muted-foreground/20 transition-colors"
            >
              <span className="font-medium flex items-center gap-1.5 text-primary mb-1.5">
                <MessageSquare className="h-4 w-4" />
                {t('definition')}
              </span>
              <p className="mt-1 text-sm sm:text-base">{currentWord.definition}</p>
              {currentWord.vietnameseTranslation && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-2 text-sm italic text-muted-foreground p-2 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    {t('words')}
                  </div>
                  <p>{currentWord.vietnameseTranslation}</p>
                </motion.div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-background/90 p-3 sm:p-4 rounded-lg shadow-sm border border-muted hover:border-muted-foreground/20 transition-colors"
            >
              <span className="font-medium flex items-center gap-1.5 text-primary mb-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-quote"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                {t('example')}
              </span>
              <div className="mt-1 text-sm sm:text-base p-2 bg-primary/5 rounded-md">
                {typeof formatExample(currentWord.example, currentWord.word) === 'string' 
                  ? formatExample(currentWord.example, currentWord.word) as string
                  : formatExample(currentWord.example, currentWord.word)}
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 sm:mt-5"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={nextWord} 
                className={cn(
                  "w-full gap-1 text-base py-6 shadow-md transition-all",
                  !isLastWord 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                )}
              >
                {!isLastWord ? (
                  <>
                    {t('nextWord')}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                ) : (
                  <>
                    {t('finishGame')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                  </>
                )}
                <kbd className="ml-1 px-1.5 py-0.5 text-xs border rounded-md bg-background/20">Enter</kbd>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </TooltipProvider>
  );
} 