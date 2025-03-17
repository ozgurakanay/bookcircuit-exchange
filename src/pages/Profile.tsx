import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, X, Upload, Camera, Loader2 } from 'lucide-react';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';
import Button from '@/components/ui-custom/Button';
import { useAuth } from '@/context/AuthContext';
import { supabase, verifySessionWithServer } from '@/lib/supabase';
import { toast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  full_name: string;
  bio: string;
  location: string;
  favorite_genre: string;
  website: string;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    bio: '',
    location: '',
    favorite_genre: '',
    website: '',
    avatar_url: null
  });

  // First verify session is valid
  useEffect(() => {
    const verifySession = async () => {
      console.log("Profile - Verifying session");
      
      if (!user) {
        // Not logged in, redirect to login
        console.log("Profile - No user in context, redirecting to signin");
        navigate('/signin', { replace: true });
        return;
      }
      
      try {
        const { valid, error } = await verifySessionWithServer();
        
        if (!valid) {
          console.error("Profile - Session verification failed:", error);
          toast({
            title: "Session Error",
            description: "Your session appears to be invalid. Please sign in again.",
            variant: "destructive"
          });
          
          // Clear the invalid session
          await supabase.auth.signOut();
          navigate('/signin', { replace: true });
          return;
        }
        
        console.log("Profile - Session verified successfully");
        setSessionVerified(true);
      } catch (err) {
        console.error("Profile - Error verifying session:", err);
        toast({
          title: "Session Error",
          description: "Failed to verify your session. Please sign in again.",
          variant: "destructive"
        });
        navigate('/signin', { replace: true });
      }
    };
    
    verifySession();
  }, [user, navigate]);

  // Handle authentication and profile data once session verified
  useEffect(() => {
    const initProfile = async () => {
      if (!user || !sessionVerified) {
        return; // Wait until session is verified
      }
      
      setLoading(true);
      
      // Set initial profile data from auth context if available
      if (authProfile) {
        console.log("Using profile data from auth context");
        setProfile({
          id: authProfile.id,
          full_name: authProfile.full_name || '',
          bio: authProfile.bio || '',
          location: authProfile.location || '',
          favorite_genre: authProfile.favorite_genre || '',
          website: authProfile.website || '',
          avatar_url: authProfile.avatar_url || null
        });
        setLoading(false);
        return;
      }
      
      // Otherwise fetch profile directly
      try {
        console.log("Fetching profile directly for user:", user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error.message);
          
          // If profile doesn't exist, create a new one
          if (error.code === 'PGRST116') {
            await createProfile(user.id);
            return;
          }
          
          toast({
            title: "Error loading profile",
            description: error.message,
            variant: "destructive"
          });
        } else if (data) {
          console.log("Profile data received:", data);
          setProfile({
            id: user.id,
            full_name: data.full_name || '',
            bio: data.bio || '',
            location: data.location || '',
            favorite_genre: data.favorite_genre || '',
            website: data.website || '',
            avatar_url: data.avatar_url
          });
          
          // Update auth context
          refreshProfile();
        }
      } catch (error: any) {
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    };
    
    initProfile();
  }, [user, authProfile, navigate, refreshProfile, sessionVerified]);

  // Create a new profile for the user
  const createProfile = async (userId: string) => {
    try {
      console.log("Creating new profile for user:", userId);
      
      const newProfile = {
        id: userId,
        full_name: '',
        bio: '',
        location: '',
        favorite_genre: '',
        website: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error.message);
        toast({
          title: "Error creating profile",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        console.log("New profile created:", data);
        setProfile({
          id: userId,
          full_name: '',
          bio: '',
          location: '',
          favorite_genre: '',
          website: '',
          avatar_url: null
        });
        
        // Update auth context
        refreshProfile();
      }
    } catch (error: any) {
      console.error('Error creating profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/signin');
      return;
    }
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          favorite_genre: profile.favorite_genre,
          website: profile.website,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Update auth context with new profile data
      refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user?.id}/avatar.${fileExt}`;
    
    try {
      setAvatarUploading(true);
      
      // Upload image to storage
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with avatar URL
      setProfile(prev => ({
        ...prev,
        avatar_url: data.publicUrl
      }));
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile image has been updated",
      });
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAvatarUploading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-20 flex items-center justify-center">
          <div className="flex items-center">
            <Loader2 className="h-8 w-8 animate-spin text-book-accent mr-2" />
            <span className="text-book-dark">Loading profile...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-xl p-8 shadow-lg mb-8">
              <div className="flex items-center mb-8">
                <User className="h-6 w-6 text-book-accent mr-2" />
                <h1 className="text-2xl md:text-3xl font-bold font-serif">Your Profile</h1>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-8 flex flex-col items-center">
                  <div className="relative mb-4">
                    {avatarUploading ? (
                      <div className="w-32 h-32 rounded-full bg-book-light/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-book-accent" />
                      </div>
                    ) : (
                      profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-full object-cover border-2 border-book-accent"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-book-light/50 flex items-center justify-center">
                          <User className="h-16 w-16 text-book-accent/40" />
                        </div>
                      )
                    )}
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute bottom-0 right-0 bg-book-accent text-white p-2 rounded-full cursor-pointer hover:bg-book-accent/80 transition-colors"
                    >
                      <Camera className="h-5 w-5" />
                    </label>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                  </div>
                  <p className="text-sm text-book-dark/60">Click the camera icon to upload a profile image</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-book-dark font-medium mb-2">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      name="full_name"
                      value={profile.full_name} 
                      onChange={handleChange}
                      className="w-full p-3 rounded-md bg-white/80 border border-book-light focus:outline-none focus:ring-2 focus:ring-book-accent/50 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-book-dark font-medium mb-2">
                      Location
                    </label>
                    <input 
                      type="text" 
                      name="location"
                      value={profile.location} 
                      onChange={handleChange}
                      className="w-full p-3 rounded-md bg-white/80 border border-book-light focus:outline-none focus:ring-2 focus:ring-book-accent/50 transition-all"
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-book-dark font-medium mb-2">
                      Favorite Book Genre
                    </label>
                    <input 
                      type="text" 
                      name="favorite_genre"
                      value={profile.favorite_genre} 
                      onChange={handleChange}
                      className="w-full p-3 rounded-md bg-white/80 border border-book-light focus:outline-none focus:ring-2 focus:ring-book-accent/50 transition-all"
                      placeholder="e.g. Science Fiction, Fantasy, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-book-dark font-medium mb-2">
                      Website or Social Profile
                    </label>
                    <input 
                      type="text" 
                      name="website"
                      value={profile.website} 
                      onChange={handleChange}
                      className="w-full p-3 rounded-md bg-white/80 border border-book-light focus:outline-none focus:ring-2 focus:ring-book-accent/50 transition-all"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-book-dark font-medium mb-2">
                      Bio
                    </label>
                    <textarea 
                      name="bio"
                      value={profile.bio} 
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-3 rounded-md bg-white/80 border border-book-light focus:outline-none focus:ring-2 focus:ring-book-accent/50 transition-all resize-none"
                      placeholder="Tell us a bit about yourself and your reading interests..."
                    />
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    as="a"
                    href="/dashboard"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="primary"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile; 