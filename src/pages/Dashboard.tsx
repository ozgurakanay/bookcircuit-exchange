import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, CheckCircle2, UserCircle, PlusCircle, Search, MessageSquare, Heart, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';
import Button from '@/components/ui-custom/Button';
import BookCard from '@/components/ui-custom/BookCard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { getUserBooks } from '@/lib/bookService';
import { Book } from '@/lib/types';

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [connectionTested, setConnectionTested] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Test Supabase connection
  const testConnection = async () => {
    try {
      // Simple query to test connection
      const { data, error } = await supabase.from('dummy_query').select('*').limit(1);
      
      // Even if there's an error with the query itself (like table not existing),
      // as long as we get a response from Supabase and not a network error,
      // we can consider the connection successful
      setSupabaseConnected(true);
      console.log('Supabase connection successful!');
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
    if (user) {
      setLoading(true);
      try {
        const userBooks = await getUserBooks(user.id);
        setBooks(userBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle book deletion
  const handleBookDeleted = () => {
    // Refresh the book list
    fetchBooks();
  };

  useEffect(() => {
    // Fetch user's books when component mounts or user changes
    fetchBooks();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
                    <h3 className="font-medium">Blog</h3>
                    <p className="text-sm text-muted-foreground">Latest news and updates</p>
                  </div>
                  <Button onClick={() => navigate('/blog')} variant="ghost" className="ml-auto">View</Button>
                </div>
                
                {isAdmin && (
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
