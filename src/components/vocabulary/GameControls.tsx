import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GameControlsProps {
  difficulty: string;
  setDifficulty: (value: string) => void;
  wordCount: number;
  setWordCount: (value: number) => void;
  fetchVocabulary: () => Promise<void>;
  loading: boolean;
}

export function GameControls({
  difficulty,
  setDifficulty,
  wordCount,
  setWordCount,
  fetchVocabulary,
  loading
}: GameControlsProps) {
  const { t } = useLanguage();
  
  return (
    <div className="mb-4 bg-muted/30 rounded-lg p-2 sm:p-3 flex flex-col sm:flex-row gap-2 sm:items-end">
      <div className="flex-1">
        <label className="text-sm font-medium mb-1 block">{t('difficultyLevel')}</label>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder={t('allLevels')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allLevels')}</SelectItem>
            <SelectItem value="beginner">{t('beginner')}</SelectItem>
            <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
            <SelectItem value="advanced">{t('advanced')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <label className="text-sm font-medium mb-1 block">{t('numberOfWords')}</label>
        <Select 
          value={wordCount.toString()} 
          onValueChange={(value) => setWordCount(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="5 Words" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 {t('words')}</SelectItem>
            <SelectItem value="10">10 {t('words')}</SelectItem>
            <SelectItem value="15">15 {t('words')}</SelectItem>
            <SelectItem value="20">20 {t('words')}</SelectItem>
            <SelectItem value="30">30 {t('words')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={fetchVocabulary} 
        className="flex-1 sm:flex-initial mt-2 sm:mt-0" 
        disabled={loading}
      >
        {loading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            {t('loading')}
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('newWords')}
          </>
        )}
      </Button>
    </div>
  );
} 