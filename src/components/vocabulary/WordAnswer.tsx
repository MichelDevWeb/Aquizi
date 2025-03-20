import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Volume, ChevronRight, CheckCircle, XCircle, BookOpen, MessageSquare, Globe, Quote, Flame } from "lucide-react";
import { Vocabulary } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import confetti from 'canvas-confetti';
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";

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
            "p-3 sm:p-5 rounded-lg transition-all shadow-lg border-2",
            answerStatus === 'correct' 
              ? "bg-gradient-to-br from-green-50 to-green-100/50 border-green-300 dark:from-green-900/30 dark:to-green-900/10 dark:border-green-800" 
              : "bg-gradient-to-br from-red-50 to-red-100/50 border-red-300 dark:from-red-900/30 dark:to-red-900/10 dark:border-red-800"
          )}>
          <div className="flex items-center space-x-3 mb-3">
            {answerStatus === 'correct' ? (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 10 }}
                className="flex items-center text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 p-2 rounded-full shadow-sm"
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 10 }}
                className="flex items-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 p-2 rounded-full shadow-sm"
              >
                <XCircle className="h-5 w-5" />
              </motion.div>
            )}
            <div>
              <motion.h3 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="font-bold text-base sm:text-lg"
              >
                {answerStatus === 'correct' ? t('correct') : t('incorrect')}
              </motion.h3>
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1.5"
              >
                {answerStatus === 'correct' ? (
                  <Badge variant="outline" className="bg-green-100/70 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 px-1.5 py-0 text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    +10 {t('points')}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t('correct')}: <span className="font-medium">{currentWord.word}</span>
                  </span>
                )}
              </motion.div>
            </div>
          </div>
          
          <div className="grid gap-3 mt-4">
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-background/90 p-3 rounded-lg shadow-sm border border-muted hover:border-muted-foreground/20 transition-colors"
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm text-primary">{t('word')}</span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0"
                      onClick={() => {
                        if (currentWord.audioUrl) {
                          playAudio(currentWord.audioUrl);
                        } else {
                          generateSpeech(currentWord.word, currentWord.id);
                        }
                      }}
                    >
                      <Volume className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex items-center gap-1">
                      {t('pronunciation')}
                      <kbd className="px-1 py-0.5 text-xs bg-muted rounded">P</kbd>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="px-1">
                <h3 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  {currentWord.word}
                </h3>
                {currentWord.pronunciation && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono">
                    {currentWord.pronunciation}
                  </p>
                )}
                {currentWord.partOfSpeech && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {currentWord.partOfSpeech}
                  </Badge>
                )}
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-background/90 p-3 rounded-lg shadow-sm border border-muted hover:border-muted-foreground/20 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm text-primary">{t('definition')}</span>
                </div>
                <p className="mt-1 text-sm">{currentWord.definition}</p>
                {currentWord.vietnameseTranslation && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-2 text-sm italic text-muted-foreground p-2 bg-muted/50 rounded-md"
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span>{t('translation')}</span>
                    </div>
                    <p className="text-xs sm:text-sm">{currentWord.vietnameseTranslation}</p>
                  </motion.div>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-background/90 p-3 rounded-lg shadow-sm border border-muted hover:border-muted-foreground/20 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Quote className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm text-primary">{t('example')}</span>
                </div>
                <div className="mt-1 text-sm p-2 bg-primary/5 rounded-md">
                  {typeof formatExample(currentWord.example, currentWord.word) === 'string' 
                    ? formatExample(currentWord.example, currentWord.word) as string
                    : formatExample(currentWord.example, currentWord.word)}
                </div>
              </motion.div>
            </div>
            
            {((currentWord.synonyms && currentWord.synonyms.length > 0) || 
              (currentWord.antonyms && currentWord.antonyms.length > 0)) && (
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-background/90 p-3 rounded-lg shadow-sm border border-muted hover:border-muted-foreground/20 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                    <div>
                      <span className="font-medium text-sm text-primary mb-1.5 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-diff"><path d="M12 3v14"/><path d="M5 10h14"/><path d="M5 21h14"/></svg>
                        {t('synonym')}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {currentWord.synonyms.map((synonym, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {synonym}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {currentWord.antonyms && currentWord.antonyms.length > 0 && (
                    <div>
                      <span className="font-medium text-sm text-primary mb-1.5 flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shuffle"><path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/></svg>
                        {t('antonyms')}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {currentWord.antonyms.map((antonym, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {antonym}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 sm:mt-5"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={nextWord} 
                className={cn(
                  "w-full gap-1 text-base py-5 sm:py-6 shadow-md transition-all",
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
                    <Flame className="h-4 w-4 ml-1" />
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