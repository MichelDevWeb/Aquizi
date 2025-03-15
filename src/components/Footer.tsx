"use client";

import React from "react";
import { Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";
import { convertDateToString } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// Social media link component
const SocialLink = ({ 
  href, 
  icon: Icon, 
  label 
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string;
}) => (
  <a
    href={href}
    rel="noreferrer"
    target="_blank"
    className="transition text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
    aria-label={label}
  >
    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
  </a>
);

// Legal link component
const LegalLink = ({ 
  href, 
  children 
}: { 
  href: string; 
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="hover:text-gray-700 dark:hover:text-gray-300 transition"
  >
    {children}
  </Link>
);

// Social links section
const SocialLinks = () => (
  <div className="flex justify-center gap-3 sm:gap-4">
    <SocialLink 
      href="https://github.com/micheldevweb/aquizi" 
      icon={Github} 
      label="GitHub" 
    />
    <SocialLink 
      href="https://x.com/NguyenMich67756" 
      icon={Twitter} 
      label="Twitter" 
    />
    <SocialLink 
      href="https://www.linkedin.com/in/michel-nguyen-407950144/" 
      icon={Linkedin} 
      label="LinkedIn" 
    />
  </div>
);

// Legal links section
const LegalLinks = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
      <LegalLink href="/privacy">{t('privacyPolicy')}</LegalLink>
      <span className="text-gray-400">•</span>
      <LegalLink href="/terms">{t('termsOfService')}</LegalLink>
    </div>
  );
};

// Main Footer component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white dark:bg-gray-950 mt-auto w-full pb-16 md:pb-4">
      <div className="mx-auto max-w-screen-xl px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <p className="text-center text-xs sm:text-sm text-gray-500 sm:text-left">
            {t('copyright', { year: currentYear })}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <SocialLinks />
            <LegalLinks />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
