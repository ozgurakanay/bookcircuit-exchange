import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, profileClient } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
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
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const navigate = useNavigate();

  // Fetch user profile from the database
  const fetchProfile = async (userId: string) => {
    console.log('DEBUG: Starting fetchProfile for user:', userId);
    try {
      // Use the profileClient with shorter timeout for faster queries
      const { data, error } = await profileClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      console.log('DEBUG: fetchProfile response for user:', userId, data, error);
      if (error) {
        console.error('Error fetching profile:', error.message);
        if (error.code === 'PGRST116') {
          console.log('DEBUG: Profile not found for user, creating default profile');
          return await createDefaultProfile(userId);
        }
        return null;
      }

      console.log('DEBUG: Fetched profile data:', data);
      return data as Profile;
    } catch (error: any) {
      console.error('Failed to fetch profile:', error.message);
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

  // Modify the useEffect in AuthContext for more efficient handling
  useEffect(() => {
    let mounted = true;
    let initialSessionChecked = false;
    
    // More efficient session check
    async function getInitialSession() {
      console.log('DEBUG: Starting auth session check');
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('DEBUG: getSession response:', data, error);

        if (error) {
          console.error('DEBUG: Error during getSession:', error);
          setError(error);
        } else if (data && data.session) {
          console.log('DEBUG: Session found:', data.session);
          if (mounted) {
            setUser(data.session.user);
            
            // Fetch profile with a reduced timeout
            try {
              const profilePromise = fetchProfile(data.session.user.id);
              const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
              );
              
              const profileData = await Promise.race([profilePromise, timeoutPromise])
                .catch(err => {
                  console.error('DEBUG: Profile fetch failed or timed out:', err);
                  return null;
                }) as Profile | null;
                
              if (mounted) {
                console.log('DEBUG: Setting profile after fetch/timeout:', profileData);
                setProfile(profileData);
              }
            } catch (profileError) {
              console.error('DEBUG: Error in profile fetch block:', profileError);
            }
          }
        } else {
          console.log('DEBUG: No session data returned');
        }
      } catch (e) {
        console.error('DEBUG: Unexpected error in getInitialSession:', e);
      }
      
      // Mark initial session as checked to prevent duplicate work
      initialSessionChecked = true;
      
      // Ensure loading is always set to false
      if (mounted) {
        console.log('DEBUG: Setting loading to false');
        setLoading(false);
      }
    }

    getInitialSession();

    // Set up auth listener with optimized handling
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('DEBUG: Auth state changed:', event, session);
        
        // Skip duplicate processing if initial session is still being checked
        if (!initialSessionChecked) {
          console.log('DEBUG: Skipping auth state change handling - initial session check in progress');
          return;
        }
        
        if (mounted) {
          // Only set loading true if we need to fetch a profile
          const needsProfileFetch = session?.user && (!user || user.id !== session.user.id);
          if (needsProfileFetch) {
            setLoading(true);
          }
          
          // Update user state
          if (session && session.user) {
            setUser(session.user);
            
            // Only fetch profile if user changed
            if (needsProfileFetch) {
              try {
                // Reduced timeout for faster response
                const profilePromise = fetchProfile(session.user.id);
                const timeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Auth state change profile fetch timeout')), 2000)
                );
                
                const profileData = await Promise.race([profilePromise, timeoutPromise])
                  .catch(err => {
                    console.error('DEBUG: Auth state change profile fetch failed or timed out:', err);
                    return null;
                  }) as Profile | null;
                  
                if (mounted) {
                  console.log('DEBUG: Setting profile after auth state change:', profileData);
                  setProfile(profileData);
                }
              } catch (profileError) {
                console.error('DEBUG: Error in auth state change profile fetch:', profileError);
              } finally {
                if (mounted) {
                  console.log('DEBUG: Setting loading to false after auth state change');
                  setLoading(false);
                }
              }
            }
          } else {
            setUser(null);
            setProfile(null);
            if (needsProfileFetch) {
              setLoading(false);
            }
          }
        }
      }
    );

    // Cleanup function to run on unmount
    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
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
      
      // Clear user and profile state
      setUser(null);
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

  const value = {
    user,
    profile,
    loading,
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
