import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookOpen, Play, Info, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface WelcomeScreenProps {
  difficulty: string;
  setDifficulty: (value: string) => void;
  wordCount: number;
  setWordCount: (value: number) => void;
  onStartGame: () => void;
}

export function WelcomeScreen({
  difficulty,
  setDifficulty,
  wordCount,
  setWordCount,
  onStartGame
}: WelcomeScreenProps) {
  const { t } = useLanguage();
  
  const handleWordCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 20) {
      setWordCount(value);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('vocabularyPractice')}</CardTitle>
          <CardDescription>{t('vocabularyPracticeDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Game settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="difficulty">{t('difficulty')}</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder={t('selectDifficulty')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allLevels')}</SelectItem>
                  <SelectItem value="beginner">{t('beginner')}</SelectItem>
                  <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
                  <SelectItem value="advanced">{t('advanced')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wordCount">{t('wordCount')}</Label>
              <Input
                id="wordCount"
                type="number"
                min="1"
                max="20"
                value={wordCount}
                onChange={handleWordCountChange}
              />
            </div>
          </div>
          
          {/* Smart learning feature */}
          <div className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Brain className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium text-sm mb-1">{t('smartLearning')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('smartLearningDesc')}
                </p>
                <Badge variant="outline" className="mt-2 bg-primary/10">
                  {t('newFeature')}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Game instructions */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-medium text-sm mb-1">{t('howToPlay')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('howToPlayDesc')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button onClick={onStartGame} size="lg" className="gap-2">
            <Play className="h-4 w-4" />
            {t('startGame')}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 