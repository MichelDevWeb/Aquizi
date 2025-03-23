import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { ForgotPassword } from "./ForgotPassword";
import { motion, AnimatePresence } from "framer-motion";

type AuthTabState = "login" | "signup" | "forgotPassword";

interface AuthTabsProps {
  defaultTab?: "login" | "signup";
}

export function AuthTabs({ defaultTab = "login" }: AuthTabsProps) {
  const [tabState, setTabState] = useState<AuthTabState>(defaultTab);

  const handleForgotPasswordClick = () => {
    setTabState("forgotPassword");
  };

  const handleBackToLogin = () => {
    setTabState("login");
  };

  const handleSignupClick = () => {
    setTabState("signup");
  };

  const handleLoginClick = () => {
    setTabState("login");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {tabState === "forgotPassword" ? (
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ForgotPassword onBack={handleBackToLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="auth-tabs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs defaultValue={tabState} onValueChange={(value) => setTabState(value as AuthTabState)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm 
                  onForgotPassword={handleForgotPasswordClick}
                  onSignUpClick={handleSignupClick}
                />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignupForm onLoginClick={handleLoginClick} />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 