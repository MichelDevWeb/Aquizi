import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface GoogleSignInProps {
  text?: string;
  className?: string;
}

export function GoogleSignIn({ text = "Sign in with Google", className }: GoogleSignInProps) {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      <Button 
        variant="outline" 
        className={`w-full flex items-center justify-center gap-2 ${className}`}
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Image 
            src="/google-logo.svg" 
            alt="Google" 
            width={18} 
            height={18} 
            className="h-4 w-4"
          />
        )}
        {text}
      </Button>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 