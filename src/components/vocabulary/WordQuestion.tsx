import React, { MutableRefObject, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lightbulb, Volume, Globe, X, BookOpen, MessageSquare, Headphones, Sparkles, CheckCircle, Eye, EyeOff, Keyboard } from "lucide-react";
import { Vocabulary } from "./types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface WordQuestionProps {
  currentWord: Vocabulary;
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  checkAnswer: () => void;
  showHint: boolean;
  toggleHint: () => void;
  answerStatus: 'correct' | 'incorrect' | null;
  showDefinitionTranslation: boolean;
  showExampleTranslation: boolean;
  definitionTranslation: string;
  exampleTranslation: string;
  setShowDefinitionTranslation: (value: boolean) => void;
  setShowExampleTranslation: (value: boolean) => void;
  generateTranslation: (text: string, type: 'definition' | 'example') => Promise<void>;
  generateSpeech: (word: string, documentId: string) => Promise<void>;
  playAudio: (audioUrl: string) => void;
  formatExample: (example: string, word: string) => string | React.ReactNode;
  answerInputRef: MutableRefObject<HTMLInputElement | null>;
}

export function WordQuestion({
  currentWord,
  userAnswer,
  setUserAnswer,
  checkAnswer,
  showHint,
  toggleHint,
  answerStatus,
  showDefinitionTranslation,
  showExampleTranslation,
  definitionTranslation,
  exampleTranslation,
  setShowDefinitionTranslation,
  setShowExampleTranslation,
  generateTranslation,
  generateSpeech,
  playAudio,
  formatExample,
  answerInputRef
}: WordQuestionProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const handlePlayAudio = () => {
    setIsAudioPlaying(true);
    
    if (currentWord.audioUrl) {
      playAudio(currentWord.audioUrl);
      setTimeout(() => setIsAudioPlaying(false), 1500);
    } else {
      // If audio URL is not available, generate speech
      generateSpeech(currentWord.word, currentWord.id)
        .finally(() => {
          setTimeout(() => setIsAudioPlaying(false), 1500);
        });
      
      toast({
        title: t('pronunciation'),
        description: t('loading'),
        variant: "default",
        className: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 pt-3"
    >
      <div className="grid gap-4">
        {/* Definition Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-muted/50 bg-card shadow-sm overflow-hidden"
        >
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/5 to-primary/10">
            <h3 className="font-medium text-sm sm:text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {t('definition')}
            </h3>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-muted border rounded-md font-mono text-xs min-w-[28px] text-center">
                T
              </kbd>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (!showDefinitionTranslation && !definitionTranslation) {
                          generateTranslation(currentWord.definition, 'definition');
                        }
                        setShowDefinitionTranslation(!showDefinitionTranslation);
                      }}
                      className="h-7 w-7 rounded-full hover:bg-primary/10"
                    >
                      {showDefinitionTranslation ? 
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : 
                        <Globe className="h-3.5 w-3.5 text-primary" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {showDefinitionTranslation ? t('hideTranslation') : t('showTranslation')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-sm sm:text-base">{currentWord.definition}</p>
            <AnimatePresence>
              {showDefinitionTranslation && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-2.5 bg-primary/5 rounded-md border border-primary/10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe className="h-3 w-3 text-primary/70" />
                      <p className="text-xs text-muted-foreground">{t('translation')}</p>
                    </div>
                    <p className="text-sm italic text-foreground/80">
                      {definitionTranslation || currentWord.vietnameseTranslation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Example Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-muted/50 bg-card shadow-sm overflow-hidden"
        >
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/5 to-primary/10">
            <h3 className="font-medium text-sm sm:text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              {t('example')}
            </h3>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-muted border rounded-md font-mono text-xs min-w-[28px] text-center">
                E
              </kbd>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (!showExampleTranslation && !exampleTranslation) {
                          generateTranslation(currentWord.example, 'example');
                        }
                        setShowExampleTranslation(!showExampleTranslation);
                      }}
                      className="h-7 w-7 rounded-full hover:bg-primary/10"
                    >
                      {showExampleTranslation ? 
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : 
                        <Globe className="h-3.5 w-3.5 text-primary" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {showExampleTranslation ? t('hideTranslation') : t('showTranslation')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-sm sm:text-base">
              {typeof formatExample(currentWord.example, currentWord.word) === 'string' 
                ? formatExample(currentWord.example, currentWord.word) as string
                : formatExample(currentWord.example, currentWord.word)}
            </p>
            <AnimatePresence>
              {showExampleTranslation && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-2.5 bg-primary/5 rounded-md border border-primary/10">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Globe className="h-3 w-3 text-primary/70" />
                      <p className="text-xs text-muted-foreground">{t('translation')}</p>
                    </div>
                    <p className="text-sm italic text-foreground/80">
                      {exampleTranslation || `Ví dụ: ${currentWord.vietnameseTranslation.split(' ').slice(0, 5).join(' ')}...`}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Pronunciation Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-muted/50 bg-card shadow-sm overflow-hidden"
        >
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/5 to-primary/10">
            <h3 className="font-medium text-sm sm:text-base flex items-center gap-2">
              <Headphones className="h-4 w-4 text-primary" />
              {t('pronunciation')}
            </h3>
            <div className="flex items-center gap-1.5">
              <kbd className="px-2 py-1 bg-muted border rounded-md font-mono text-xs min-w-[28px] text-center">
                P
              </kbd>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePlayAudio}
                        className="h-7 w-7 rounded-full hover:bg-primary/10"
                        disabled={isAudioPlaying}
                      >
                        <motion.div
                          animate={isAudioPlaying ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Volume className={cn(
                            "h-4 w-4",
                            isAudioPlaying ? "text-primary" : "text-muted-foreground"
                          )} />
                        </motion.div>
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {t('play')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-sm sm:text-base font-mono">{currentWord.pronunciation}</p>
          </div>
        </motion.div>
      </div>
      
      {/* Answer Input Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4"
      >
        <div className="relative">
          <Input
            ref={answerInputRef}
            type="text"
            placeholder={t('typeYourAnswer')}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className={cn(
              "w-full pr-10 text-base sm:text-lg font-medium py-6 shadow-sm transition-all rounded-full",
              answerStatus === 'correct' && "border-green-500 ring-2 ring-green-500/50 bg-green-50 dark:bg-green-900/20",
              answerStatus === 'incorrect' && "border-red-500 ring-2 ring-red-500/50 bg-red-50 dark:bg-red-900/20"
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                checkAnswer();
              }
            }}
          />
          <AnimatePresence>
            {userAnswer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-muted"
                  onClick={() => setUserAnswer("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">{t('clear')}</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Controls Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-between items-center mt-4"
      >
        <div className="flex items-center gap-3 relative">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-muted border rounded-md font-mono text-xs min-w-[28px] text-center">
              H
            </kbd>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 rounded-full bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:hover:bg-amber-900/30 shadow-sm"
                      onClick={toggleHint}
                    >
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  {t('hint')}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {currentWord.partOfSpeech && (
            <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-full">
              {currentWord.partOfSpeech}
            </Badge>
          )}
          
          {/* Show hint with animation */}
          <AnimatePresence>
            {showHint && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg shadow-lg z-10 w-72 dark:from-amber-900/30 dark:to-amber-900/10 dark:border-amber-800"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <h4 className="font-medium text-amber-800 dark:text-amber-300">{t('hint')}</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-black/20 p-2 rounded-md">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700">
                        {t('firstLetter')}
                      </Badge>
                      <p className="text-sm font-medium">{currentWord.word[0].toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 dark:bg-black/20 p-2 rounded-md">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700">
                        {t('letters')}
                      </Badge>
                      <p className="text-sm font-medium">{currentWord.word.length}</p>
                    </div>
                    {currentWord.synonyms && currentWord.synonyms.length > 0 && (
                      <div className="flex items-center gap-2 bg-white/80 dark:bg-black/20 p-2 rounded-md">
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700">
                          {t('synonym')}
                        </Badge>
                        <p className="text-sm font-medium">{currentWord.synonyms[0]}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 bg-muted border rounded-md font-mono text-xs min-w-[50px] text-center">
            Enter
          </kbd>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button 
                    onClick={checkAnswer}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-md"
                    disabled={!userAnswer.trim()}
                  >
                    <CheckCircle className="h-6 w-6" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                {t('checkAnswer')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
    </motion.div>
  );
}