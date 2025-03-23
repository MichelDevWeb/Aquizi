import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schemas/auth-schemas";
import { useAuth } from "@/lib/firebase/firebase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { GoogleSignIn } from "./GoogleSignIn";
import { Separator } from "@/components/ui/separator";

interface LoginFormProps {
  onForgotPassword: () => void;
  onSignUpClick: () => void;
}

export function LoginForm({ onForgotPassword, onSignUpClick }: LoginFormProps) {
  const { signIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await signIn(data.email, data.password, data.rememberMe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      type="email"
                      autoComplete="email"
                      disabled={isSubmitting}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="••••••••" 
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isSubmitting}
                        {...field} 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Remember me
                    </FormLabel>
                  </FormItem>
                )}
              />
              
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm font-normal"
                onClick={onForgotPassword}
                type="button"
                disabled={isSubmitting}
              >
                Forgot password?
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        
        <div className="relative flex items-center justify-center my-6">
          <Separator className="absolute w-full" />
          <span className="relative bg-card px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>
        
        <GoogleSignIn text="Continue with Google" />
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-center">
          Don&apos;t have an account?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto"
            onClick={onSignUpClick}
            disabled={isSubmitting}
          >
            Sign up
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 