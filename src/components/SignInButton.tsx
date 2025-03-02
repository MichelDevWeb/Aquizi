"use client";
import React from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/firebase/firebase-auth";

type Props = { text: string };

const SignInButton = ({ text }: Props) => {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <Button onClick={handleSignIn}>
      {text}
    </Button>
  );
};

export default SignInButton;
