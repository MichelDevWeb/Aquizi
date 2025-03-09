import React from "react";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-950 mt-auto w-full pb-16 md:pb-4">
      <div className="mx-auto max-w-screen-xl px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 sm:pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <p className="text-center text-xs sm:text-sm text-gray-500 sm:text-left">
            Copyright &copy; {new Date().getFullYear()} Aquizi. All rights reserved.
          </p>

          <ul className="flex justify-center gap-3 sm:gap-4 sm:justify-start">
            <li>
              <a
                href="https://github.com/micheldevweb/aquizi"
                rel="noreferrer"
                target="_blank"
                className="transition hover:text-blue-700/75 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </li>
            <li>
              <a
                href="#"
                rel="noreferrer"
                target="_blank"
                className="transition hover:text-blue-700/75 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </li>
            <li>
              <Link
                href="/privacy"
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
