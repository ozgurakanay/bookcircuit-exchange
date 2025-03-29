import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, CheckCircle2, UserCircle, PlusCircle, Search, MessageSquare, Heart, ShieldCheck, BookCheck, XCircle } from 'lucide-react';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';
import Button from '@/components/ui-custom/Button';
import BookCard from '@/components/ui-custom/BookCard';
import { useAuth } from '@/context/AuthContext';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';
import { getUserBooks, getUserRequestedBooks, cancelBookRequest } from '@/lib/bookService';
import { Book } from '@/lib/types';
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { RealtimeChannel } from '@supabase/supabase-js';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [requestedBooks, setRequestedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestedLoading, setRequestedLoading] = useState(true);
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);
  const realtimeSubscriptionRef = React.useRef<RealtimeChannel | null>(null);

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const isConnected = await checkSupabaseConnection();
      setSupabaseConnected(isConnected);
      
      if (isConnected) {
        console.log('Supabase connection successful!');
      } else {
        console.error('Supabase connection issue detected');
        toast({
          title: "Connection Issue",
          description: "Unable to connect to the database. Some features may not work correctly.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Supabase connection error:', error);
      setSupabaseConnected(false);
    } finally {
      setConnectionTested(true);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  // Fetch user's books
  const fetchBooks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userBooks = await getUserBooks(user.id);
      setBooks(userBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: "Error",
        description: "Failed to load your books. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's requested books
  const fetchRequestedBooks = async () => {
    if (!user) return;
    
    setRequestedLoading(true);
    try {
      const bookRequests = await getUserRequestedBooks(user.id);
      setRequestedBooks(bookRequests);
    } catch (error) {
      console.error('Error fetching requested books:', error);
      toast({
        title: "Error",
        description: "Failed to load your requested books. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setRequestedLoading(false);
    }
  };

  // Handle book deletion
  const handleBookDeleted = () => {
    // Refresh the book list
    fetchBooks();
  };

  // Handle cancelling a book request made by the user
  const handleCancelRequest = async (requestId: string) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    if (!requestId) {
        toast({ title: "Error", description: "Invalid request ID.", variant: "destructive" });
        return;
    }

    setCancellingRequestId(requestId);
    try {
      const result = await cancelBookRequest(requestId, user.id);

      if (result.success) {
        toast({ title: "Success", description: "Book request cancelled." });
        // Remove the cancelled request from the state
        setRequestedBooks(prev => prev.filter(book => book.request_id !== requestId));
      } else {
        toast({ title: "Error", description: result.error || "Failed to cancel request.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error('Error cancelling request:', error);
      toast({ title: "Error", description: error?.message || "Failed to cancel request.", variant: "destructive" });
    } finally {
      setCancellingRequestId(null);
    }
  };

  // Set up real-time subscription for book requests
  const setupRealtimeSubscription = () => {
    if (!user) return;
    
    // Clean up any existing subscription
    if (realtimeSubscriptionRef.current) {
      supabase.removeChannel(realtimeSubscriptionRef.current);
      realtimeSubscriptionRef.current = null;
    }
    
    console.log('[Dashboard] Setting up real-time subscription for book requests');
    
    const channel = supabase
      .channel('public:book_requests')
      .on('postgres_changes', {
        event: 'DELETE', // Listen for deletions
        schema: 'public',
        table: 'book_requests',
        filter: `requester_id=eq.${user.id}`, // Only changes to this user's requests
      }, (payload) => {
        console.log('[Dashboard] Received real-time DELETE event:', payload);
        // Remove the deleted request from state
        setRequestedBooks(prev => prev.filter(book => book.request_id !== payload.old.id));
      })
      .on('postgres_changes', {
        event: 'UPDATE', // Listen for updates (e.g., status changes)
        schema: 'public',
        table: 'book_requests',
        filter: `requester_id=eq.${user.id}`, // Only changes to this user's requests
      }, (payload) => {
        console.log('[Dashboard] Received real-time UPDATE event:', payload);
        // Update the status of the modified request
        setRequestedBooks(prev => prev.map(book => {
          if (book.request_id === payload.new.id) {
            return { ...book, request_status: payload.new.status };
          }
          return book;
        }));
      })
      .on('postgres_changes', {
        event: 'INSERT', // Listen for new requests (e.g., if the user adds one on another device)
        schema: 'public',
        table: 'book_requests',
        filter: `requester_id=eq.${user.id}`, // Only changes to this user's requests
      }, (payload) => {
        console.log('[Dashboard] Received real-time INSERT event:', payload);
        // Instead of pushing incomplete data, refresh the entire list
        fetchRequestedBooks();
      })
      .subscribe((status) => {
        console.log('[Dashboard] Real-time subscription status:', status);
      });
    
    realtimeSubscriptionRef.current = channel;
  };

  // Clean up subscription on unmount
  useEffect(() => {
    return () => {
      if (realtimeSubscriptionRef.current) {
        console.log('[Dashboard] Cleaning up real-time subscription');
        supabase.removeChannel(realtimeSubscriptionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Fetch user's books when component mounts or user changes
    if (user) {
      fetchBooks();
      fetchRequestedBooks();
      setupRealtimeSubscription(); // Set up real-time updates
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <Button 
                onClick={() => navigate('/add-book')} 
                className="flex items-center gap-2"
              >
                <PlusCircle size={18} />
                Add Book
              </Button>
            </div>

            <div className="glass-card rounded-xl p-8 shadow-lg mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Welcome{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}!</h2>
                <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/10">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <UserCircle size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Profile</h3>
                    <p className="text-sm text-muted-foreground">Manage your profile information</p>
                  </div>
                  <Button onClick={() => navigate('/profile')} variant="ghost" className="ml-auto">View</Button>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/10">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BookOpen size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">My Books</h3>
                    <p className="text-sm text-muted-foreground">You have {books.length} books listed</p>
                  </div>
                  <Button onClick={() => navigate('/add-book')} variant="ghost" className="ml-auto">Add</Button>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-white/10">
                  <div className="bg-purple-500/10 p-3 rounded-full">
                    <MessageSquare size={24} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Messages</h3>
                    <p className="text-sm text-muted-foreground">Chat with other book lovers</p>
                  </div>
                  <Button onClick={() => navigate('/chat')} variant="ghost" className="ml-auto">View</Button>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/10">
                  <div className="bg-blue-500/10 p-3 rounded-full">
                    <BookCheck size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Requested Books</h3>
                    <p className="text-sm text-muted-foreground">You've requested {requestedBooks.length} books</p>
                  </div>
                  <Button onClick={() => navigate('/search')} variant="ghost" className="ml-auto">Find More</Button>
                </div>
                
                <div className="flex items-center gap-4 p-4 rounded-lg bg-purple-500/10">
                  <div className="bg-purple-500/10 p-3 rounded-full">
                    <Heart size={24} className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Blog</h3>
                    <p className="text-sm text-muted-foreground">Latest news and updates</p>
                  </div>
                  <Button onClick={() => navigate('/blog')} variant="ghost" className="ml-auto">View</Button>
                </div>
                
                {user?.user_metadata?.role === 'admin' && (
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-500/20">
                    <div className="bg-amber-500/20 p-3 rounded-full">
                      <ShieldCheck size={24} className="text-amber-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Admin Panel</h3>
                      <p className="text-sm text-muted-foreground">Manage users and system settings</p>
                    </div>
                    <Button onClick={() => navigate('/admin')} variant="ghost" className="ml-auto">Access</Button>
                  </div>
                )}
              </div>
              
              {connectionTested && (
                <div className={`mt-6 p-4 rounded-lg ${supabaseConnected ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <div className="flex items-center gap-2">
                    {supabaseConnected ? (
                      <>
                        <CheckCircle2 size={20} className="text-green-500" />
                        <span className="font-medium">Connected to Supabase</span>
                      </>
                    ) : (
                      <>
                        <div className="text-red-500">⚠️</div>
                        <span className="font-medium">Not connected to Supabase</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Books Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">My Books</h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading your books...</p>
                </div>
              ) : books.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      onDelete={handleBookDeleted}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-xl font-medium">No books yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    You haven't added any books to your collection yet.
                  </p>
                  <Button 
                    onClick={() => navigate('/add-book')} 
                    className="mt-6"
                  >
                    Add Your First Book
                  </Button>
                </div>
              )}
            </div>
            
            {/* Requested Books Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">Requested Books</h2>
              
              {requestedLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-muted-foreground">Loading your requested books...</p>
                </div>
              ) : requestedBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {requestedBooks.map((book) => (
                    <div key={book.request_id || book.id} className="flex flex-col gap-2">
                      <div className="relative">
                        <BookCard 
                          book={book} 
                        />
                        {book.request_status && (
                          <Badge className="absolute top-2 left-2 bg-blue-500 z-10">
                            Status: {book.request_status}
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 h-8 px-3 text-xs text-red-600 border-red-600 hover:bg-red-50 dark:text-red-500 dark:border-red-500 dark:hover:bg-red-900/20"
                          onClick={() => book.request_id && handleCancelRequest(book.request_id)}
                          disabled={cancellingRequestId === book.request_id || !book.request_id}
                          aria-label="Cancel Request"
                        >
                          {cancellingRequestId === book.request_id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <XCircle size={14} />
                              Cancel
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <BookCheck className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                  <h3 className="mt-4 text-xl font-medium">No requested books</h3>
                  <p className="mt-2 text-muted-foreground">
                    You haven't requested any books yet.
                  </p>
                  <Button 
                    onClick={() => navigate('/search')} 
                    className="mt-6"
                  >
                    Find Books to Request
                  </Button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <a href="/test-geography" className="text-blue-500 hover:underline">
                Test Geography Function
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
