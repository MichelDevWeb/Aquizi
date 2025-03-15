"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Github, HelpCircle, Linkedin, BookOpen, Brain, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {};

const DetailsDialog = (props: Props) => {
  const { t } = useLanguage();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
          <span className="hidden sm:inline">{t('whatIsThis')}</span>
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] p-3 sm:p-4 md:p-6">
        <DialogHeader className="pb-1 sm:pb-2">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-1 sm:gap-2">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Welcome to Aquizi!
          </DialogTitle>
          <DialogDescription>
            <div className="mt-2 sm:mt-3 md:mt-4 space-y-2 sm:space-y-3 md:space-y-4">
              <p className="text-xs sm:text-sm">
                Are you tired of mundane and repetitive quizzes? Say goodbye to
                the ordinary and embrace the extraordinary with Aquizi!
              </p>
              
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-start gap-1 sm:gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm">
                    Our platform is revolutionizing the quiz and trivia experience by
                    harnessing the immense potential of artificial intelligence.
                  </p>
                </div>
                
                <div className="flex items-start gap-1 sm:gap-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm">
                    Create custom quizzes on any topic, test your knowledge, and track your progress
                    over time with our intuitive dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 sm:mt-4 md:mt-6 justify-end">
              <Link
                href="https://github.com/MichelDevWeb/Aquizi"
                className="flex items-center gap-1 text-xs sm:text-sm hover:underline text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                GitHub
              </Link>
              <Link
                href="https://www.linkedin.com/in/michel-nguyen-407950144/"
                className="flex items-center gap-1 text-xs sm:text-sm hover:underline text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                LinkedIn
              </Link>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default DetailsDialog;
