import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loginError, setLoginError] = useState<Error | null>(null);
  const [registerError, setRegisterError] = useState<Error | null>(null);

  const router = useRouter();
  const segments = useSegments();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
          return;
        }

        console.log('Initial session:', session ? 'Found' : 'None');
        setAuthState({
          user: session?.user || null,
          session,
          isLoading: false,
          isAuthenticated: !!session,
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        
        setAuthState(prevState => ({
          user: session?.user || null,
          session,
          isLoading: false,
          isAuthenticated: !!session,
        }));

        // Clear errors on successful auth
        if (event === 'SIGNED_IN') {
          setLoginError(null);
          setRegisterError(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (authState.isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!authState.isAuthenticated && !inAuthGroup) {
      console.log("Redirecting to login - not authenticated");
      router.replace("/(auth)/login");
    } else if (authState.isAuthenticated && inAuthGroup) {
      console.log("Redirecting to tabs - authenticated");
      router.replace("/(tabs)");
    }
  }, [authState.isAuthenticated, authState.isLoading, segments]);

  const clearErrors = () => {
    setLoginError(null);
    setRegisterError(null);
  };

  const login = async (email: string, password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);

    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setLoginError(error);
        setIsLoggingIn(false);
        throw error; // Re-throw to be caught by the component
      }

      console.log('Login successful for:', data.user?.email);
      // Don't manually set loading to false here, let the auth state change handler do it
    } catch (error) {
      console.error('Login catch error:', error);
      setLoginError(error as Error);
      setIsLoggingIn(false);
      throw error; // Re-throw to be caught by the component
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsRegistering(true);
    setRegisterError(null);

    try {
      console.log('Attempting registration for:', email);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        console.error('Register error:', error.message);
        setRegisterError(error);
        setIsRegistering(false);
        throw error; // Re-throw to be caught by the component
      }

      console.log('Registration successful for:', data.user?.email);
      
      // Note: User will need to verify email before they can sign in
      if (data.user && !data.session) {
        console.log('Please check your email to verify your account');
      }
      
      setIsRegistering(false);
    } catch (error) {
      console.error('Register catch error:', error);
      setRegisterError(error as Error);
      setIsRegistering(false);
      throw error; // Re-throw to be caught by the component
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      console.log('Attempting logout');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        setIsLoggingOut(false);
        return;
      }

      console.log('Logout successful');
      setIsLoggingOut(false);
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    clearErrors,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    loginError,
    registerError,
  };
});