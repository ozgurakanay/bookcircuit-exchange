import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { toast } from "@/components/ui/use-toast";
import { Profile } from '@/lib/types';

interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signOut: () => Promise<{ success: boolean; error?: any }>;
  refreshProfile: () => Promise<void>;
  emergencyReset: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Simplified fetch profile function
  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
      }

      console.log("Profile data received:", data);
      return data as Profile;
    } catch (error: any) {
      console.error("Failed to fetch profile:", error.message);
      return null;
    }
  };

  // Refresh the user's profile data
  const refreshProfile = async () => {
    if (!user) {
      console.log("Can't refresh profile - no user");
      return;
    }
    
    try {
      console.log("Refreshing profile for user:", user.id);
      
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        console.log("Setting refreshed profile data");
        setProfile(profileData);
      } else {
        console.log("No profile data returned during refresh");
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  // Handle auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Auth initialization started");
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (session) {
          console.log("Session found, user:", session.user.email);
          
          // Set user from session
          setUser(session.user);
          
          // Fetch profile
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            console.log("Profile found and set");
            setProfile(profileData);
          } else {
            console.log("No profile found for user, attempting to create one");
            
            // Try to create a profile if none exists
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                  id: session.user.id,
                  email: session.user.email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }])
                .select()
                .single();
                
              if (createError) {
                console.error("Error creating profile:", createError);
              } else if (newProfile) {
                console.log("New profile created");
                setProfile(newProfile as Profile);
              }
            } catch (createErr) {
              console.error("Exception creating profile:", createErr);
            }
          }
        } else {
          console.log("No active session");
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Handle initialization error by clearing user state
        setUser(null);
        setProfile(null);
      } finally {
        console.log("Auth initialization complete");
        setLoading(false);
      }
    };
    
    initAuth();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (session) {
        console.log("Setting user from auth change event");
        setUser(session.user);
        
        // Ensure profile is fetched after auth state change
        try {
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            setProfile(profileData);
          } else {
            console.log("No profile data found after auth change");
          }
        } catch (profileErr) {
          console.error("Error fetching profile after auth change:", profileErr);
        }
      } else {
        console.log("Clearing user/profile from auth change event");
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Sign out
  const signOut = async () => {
    try {
      console.log("Sign out started");
      setLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        throw error;
      }
      
      // Clear state
      setUser(null);
      setProfile(null);
      
      toast({ 
        title: "Signed out", 
        description: "You have been signed out successfully",
      });
      
      navigate('/', { replace: true });
      return { success: true };
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        toast({ 
          title: "Sign up failed", 
          description: error.message,
          variant: "destructive" 
        });
        throw error;
      }
      
      toast({ 
        title: "Success!", 
        description: "Check your email to confirm your account.",
      });
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({ 
          title: "Sign in failed", 
          description: error.message,
          variant: "destructive" 
        });
        throw error;
      }
      
      toast({ 
        title: "Welcome back!", 
        description: `Signed in as ${email}`,
      });
      
      navigate('/dashboard');
      return { success: true, data };
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Add the emergencyReset function back
  const emergencyReset = async () => {
    console.log("Emergency reset: Starting");
    try {
      setLoading(true);
      
      // Force sign out from all sessions
      console.log("Emergency reset: Signing out of all sessions");
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear all localStorage
      console.log("Emergency reset: Clearing localStorage");
      localStorage.clear();
      
      // Clear all sessionStorage
      console.log("Emergency reset: Clearing sessionStorage");
      sessionStorage.clear();
      
      // Clear cookies
      console.log("Emergency reset: Clearing cookies");
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Reset state
      setUser(null);
      setProfile(null);
      
      // Show success toast
      toast({ 
        title: "Emergency Reset Complete", 
        description: "All auth data has been cleared. Please sign in again.",
      });
      
      // Redirect to sign in page
      navigate('/signin', { replace: true });
    } catch (error: any) {
      console.error("Emergency reset: Error:", error.message);
      toast({ 
        title: "Reset failed", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    emergencyReset
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
