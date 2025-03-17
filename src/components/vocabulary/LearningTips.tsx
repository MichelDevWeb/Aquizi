import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Brain, Book, Clock, Repeat, Globe, Mic, Zap, Target, ChevronDown } from "lucide-react";
import { ScrollArea } from "../../components/ui/scroll-area";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function LearningTips() {
  const { t } = useLanguage();
  
  const tips = [
    {
      icon: <Clock className="h-5 w-5 text-primary" />,
      title: t('spacedRepetition'),
      description: t('spacedRepetitionDesc'),
      color: "from-blue-500/10 to-blue-500/5"
    },
    {
      icon: <Book className="h-5 w-5 text-primary" />,
      title: t('contextLearning'),
      description: t('contextLearningDesc'),
      color: "from-green-500/10 to-green-500/5"
    },
    {
      icon: <Brain className="h-5 w-5 text-primary" />,
      title: t('activeRecall'),
      description: t('activeRecallDesc'),
      color: "from-purple-500/10 to-purple-500/5"
    },
    {
      icon: <Repeat className="h-5 w-5 text-primary" />,
      title: t('dailyPractice'),
      description: t('dailyPracticeDesc'),
      color: "from-orange-500/10 to-orange-500/5"
    },
    {
      icon: <Globe className="h-5 w-5 text-primary" />,
      title: t('immersion'),
      description: t('immersionDesc'),
      color: "from-cyan-500/10 to-cyan-500/5"
    },
    {
      icon: <Mic className="h-5 w-5 text-primary" />,
      title: t('pronunciationPractice'),
      description: t('pronunciationDesc'),
      color: "from-pink-500/10 to-pink-500/5"
    },
    {
      icon: <Zap className="h-5 w-5 text-primary" />,
      title: t('mnemonics'),
      description: t('mnemonicsDesc'),
      color: "from-yellow-500/10 to-yellow-500/5"
    },
    {
      icon: <Target className="h-5 w-5 text-primary" />,
      title: t('goalSetting'),
      description: t('goalSettingDesc'),
      color: "from-red-500/10 to-red-500/5"
    }
  ];
  
  return (
    <div className="relative">
      <ScrollArea className="h-[500px] pr-4 -mr-4">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 text-sm"
        >
          {tips.map((tip, index) => (
            <motion.div 
              key={index}
              variants={item}
              className={`group p-4 bg-gradient-to-br ${tip.color} rounded-lg hover:scale-[1.02] transition-all duration-200 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20`}
              whileHover={{ y: -2 }}
            >
              <h4 className="font-medium mb-2 flex items-center gap-2.5 text-base">
                <span className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm group-hover:scale-110 transition-transform duration-200">
                  {tip.icon}
                </span>
                {tip.title}
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed pl-[44px]">
                {tip.description}
              </p>
            </motion.div>
          ))}
          
          <motion.div 
            variants={item}
            className="mt-2 p-4 bg-primary/5 backdrop-blur-sm rounded-lg border border-primary/20 shadow-sm"
          >
            <p className="text-sm text-primary/90 leading-relaxed font-medium">
              {t('proTip')}
            </p>
          </motion.div>
        </motion.div>
      </ScrollArea>
      
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-background to-transparent flex items-center justify-center">
        <motion.div
          animate={{
            y: [0, 8, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </div>
    </div>
  );
} 