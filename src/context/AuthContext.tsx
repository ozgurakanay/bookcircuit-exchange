import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from "@/components/ui/use-toast";
import { Profile } from '@/lib/types';

interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: any }>;
  signOut: () => Promise<{ success: boolean; error?: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user profile from the database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        
        // If the profile does not exist, create one
        if (error.code === 'PGRST116') { // Supabase's "not found" error
          return await createDefaultProfile(userId);
        }
        
        return null;
      }

      return data as Profile;
    } catch (error: any) {
      console.error("Failed to fetch profile:", error.message);
      return null;
    }
  };

  // Create a default profile for a new user
  const createDefaultProfile = async (userId: string) => {
    try {
      const defaultProfile = {
        id: userId,
        full_name: '',
        bio: '',
        location: '',
        favorite_genre: '',
        website: '',
        avatar_url: '',
        role: 'user', // Default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (error) {
        console.error("Error creating default profile:", error.message);
        return null;
      }

      console.log("Created default profile for user:", userId);
      return data as Profile;
    } catch (error: any) {
      console.error("Failed to create default profile:", error.message);
      return null;
    }
  };

  // Refresh the user's profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const checkAndSetSession = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error.message);
          if (isMounted) {
            setUser(null);
            setProfile(null);
          }
        } else {
          const sessionUser = data?.session?.user || null;
          
          if (isMounted) {
            setUser(sessionUser);
          
            if (sessionUser) {
              try {
                const profileData = await fetchProfile(sessionUser.id);
                if (isMounted) {
                  setProfile(profileData);
                }
              } catch (profileError) {
                console.error("Error fetching profile in checkAndSetSession:", profileError);
                // Continue even if profile fetch fails
              }
            } else {
              setProfile(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to check authentication status:", error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        // Set loading to false regardless of outcome
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Immediately check session
    checkAndSetSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (!isMounted) return;
        
        // Always set loading to true when auth state changes
        setLoading(true);
        
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const profileData = await fetchProfile(currentUser.id);
            if (isMounted) {
              setProfile(profileData);
            }
          } catch (error) {
            console.error("Error fetching profile in auth state change:", error);
            // Continue even if profile fetch fails
          }
        } else {
          setProfile(null);
        }
        
        // Always set loading to false after handling auth state change
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      if (authListener && typeof authListener.subscription?.unsubscribe === 'function') {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

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
      
      // Fetch user profile after successful login
      if (data?.user) {
        try {
          const profileData = await fetchProfile(data.user.id);
          setProfile(profileData);
        } catch (profileError) {
          console.error("Error fetching profile after sign in:", profileError);
          // Continue even if profile fetch fails
        }
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

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({ 
          title: "Sign out failed", 
          description: error.message,
          variant: "destructive" 
        });
        throw error;
      }
      
      // Clear profile state
      setProfile(null);
      
      toast({ 
        title: "Signed out", 
        description: "You have been signed out successfully",
      });
      
      navigate('/');
      return { success: true };
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Check if user is an admin
  const isAdmin = profile ? profile.role === 'admin' : false;

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    refreshProfile,
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
