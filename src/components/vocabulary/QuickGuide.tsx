import React from "react";
import { Info, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function QuickGuide() {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="bg-muted/30 p-3 rounded-lg space-y-3">
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start">
              <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5 text-xs flex items-center justify-center h-5 w-5">1</span>
              <span>{t('generateWords')}</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5 text-xs flex items-center justify-center h-5 w-5">2</span>
              <span>{t('definition')}</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5 text-xs flex items-center justify-center h-5 w-5">3</span>
              <span>{t('showTranslation')}</span>
            </li>
            <li className="flex items-start">
              <span className="bg-primary/10 text-primary rounded-full p-1 mr-2 mt-0.5 text-xs flex items-center justify-center h-5 w-5">4</span>
              <span>{t('checkAnswer')}</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-primary/10 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs text-primary/80 leading-relaxed">
                {t('practiceRegularly')}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-primary/70">
                <Info className="h-3 w-3" />
                <span>{t('streakBonus')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}