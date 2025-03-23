"use client";

import { useState, useEffect, useRef } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPassword } from "@/components/auth/ForgotPassword";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { BookOpen, BookA, BrainCircuit, History, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoadingScreen } from "@/components/LoadingScreen";

type AuthState = "login" | "signup" | "forgotPassword";

// Feature Card Component
function FeatureCard({ 
  icon, 
  title, 
  description, 
  delay = 0,
  action = null
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  delay?: number;
  action?: React.ReactNode | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center p-6 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-3 bg-primary/10 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-4">{description}</p>
      {action}
    </motion.div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const [authState, setAuthState] = useState<AuthState>("login");
  const [isClient, setIsClient] = useState(false);
  const authSectionRef = useRef<HTMLDivElement>(null);
  
  // Set isClient to true when component mounts (client-side)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Show loading screen while checking authentication
  if (!isClient || loading) {
    return <LoadingScreen />;
  }

  const handleForgotPasswordClick = () => setAuthState("forgotPassword");
  const handleLoginClick = () => {
    setAuthState("login");
    setTimeout(() => {
      authSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  const handleSignupClick = () => {
    setAuthState("signup");
    setTimeout(() => {
      authSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const renderHeroSection = () => (
    <section className="w-full bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col space-y-4 md:w-1/2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold tracking-tight"
          >
            Learn Smarter with Aquizi
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-xl text-muted-foreground"
          >
            Create personalized quizzes, build vocabulary, and track your learning progress all in one place.
          </motion.p>
          {!user && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex gap-4 mt-4"
            >
              <Button 
                size="lg" 
                onClick={handleSignupClick}
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={handleLoginClick}
              >
                Sign In
              </Button>
            </motion.div>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="md:w-1/2 flex justify-center"
        >
          <Image
            src="/images/owl-landing-no-bg.png"
            alt="Aquizi learning assistant"
            width={400}
            height={400}
            priority
            className="object-contain"
          />
        </motion.div>
      </div>
    </section>
  );

  const renderFeaturesForGuests = () => (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Powerful Learning Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to enhance your learning experience in one platform
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-primary" />}
            title="Smart Quizzes"
            description="Create and take quizzes that adapt to your learning pace"
            delay={0.1}
          />
          <FeatureCard
            icon={<BookA className="h-6 w-6 text-primary" />}
            title="Vocabulary Builder"
            description="Build and practice vocabulary with spaced repetition"
            delay={0.2}
          />
          <FeatureCard
            icon={<BrainCircuit className="h-6 w-6 text-primary" />}
            title="AI Assistance"
            description="Get help from AI to create and improve your learning materials"
            delay={0.3}
          />
          <FeatureCard
            icon={<History className="h-6 w-6 text-primary" />}
            title="Progress Tracking"
            description="Track your learning progress over time with detailed insights"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );

  const renderFeaturesForAuthenticatedUsers = () => (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Welcome Back, {user?.displayName || 'User'}!</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Continue your learning journey with Aquizi
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<LayoutDashboard className="h-6 w-6 text-primary" />}
            title="Dashboard"
            description="View your learning progress and recent activities"
            delay={0.1}
            action={
              <Button variant="default" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            }
          />
          <FeatureCard
            icon={<BookOpen className="h-6 w-6 text-primary" />}
            title="Quizzes"
            description="Create new quizzes or practice with existing ones"
            delay={0.2}
            action={
              <Button variant="default" asChild>
                <Link href="/quiz">Explore Quizzes</Link>
              </Button>
            }
          />
          <FeatureCard
            icon={<BookA className="h-6 w-6 text-primary" />}
            title="Vocabulary"
            description="Build and review your vocabulary items"
            delay={0.3}
            action={
              <Button variant="default" asChild>
                <Link href="/vocabulary">Manage Vocabulary</Link>
              </Button>
            }
          />
        </div>
      </div>
    </section>
  );

  const renderAuthenticationSection = () => (
    <section 
      ref={authSectionRef}
      className="w-full py-16 md:py-24 bg-gradient-to-t from-primary/5 to-background"
    >
      <div className="container px-4 md:px-6 mx-auto flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Start Your Learning Journey</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Sign in to your account or create a new one to get started
          </p>
        </div>
        
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {authState === "login" && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm
                  onForgotPassword={handleForgotPasswordClick}
                  onSignUpClick={handleSignupClick}
                />
              </motion.div>
            )}
            
            {authState === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignupForm onLoginClick={handleLoginClick} />
              </motion.div>
            )}
            
            {authState === "forgotPassword" && (
              <motion.div
                key="forgot-password"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ForgotPassword onBack={handleLoginClick} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );

  return (
    <main className="flex flex-col items-center min-h-screen">
      {renderHeroSection()}
      
      {user 
        ? renderFeaturesForAuthenticatedUsers() 
        : (
          <>
            {renderAuthenticationSection()}
            {renderFeaturesForGuests()}
          </>
        )
      }
    </main>
  );
}
