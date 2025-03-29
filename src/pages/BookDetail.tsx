import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/supabase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { MessageCircle, ArrowLeft, MapPin, Calendar, BookOpen } from 'lucide-react';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';
import { toast } from '@/components/ui/use-toast';

interface BookDetails {
  id: string;
  title: string;
  author: string;
  description: string;
  condition: string;
  location_text: string;
  cover_img_url: string;
  isbn: string;
  created_at: string;
  user_id: string;
  owner?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

const BookDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch book details
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', id)
          .single();
          
        if (bookError) throw bookError;
        
        // Fetch book owner details
        const { data: ownerData, error: ownerError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', bookData.user_id)
          .single();
          
        if (ownerError) throw ownerError;
        
        // Combine the data
        setBook({
          ...bookData,
          owner: ownerData
        });
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Could not load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const startConversation = async () => {
    if (!user || !book?.owner) return;
    
    // Don't start a conversation with yourself
    if (user.id === book.owner.id) {
      toast({
        title: "Error",
        description: "This is your own book!",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setStartingChat(true);
      
      // Call the RPC function we created in the database to start or retrieve a conversation
      const { data, error } = await supabase
        .rpc('start_conversation', { 
          other_user_id: book.owner.id,
          initial_message: `Hi, I'm interested in your book "${book.title}"! Is it still available?`,
          book_id: book.id
        });
        
      if (error) throw error;
      
      // Navigate to the chat page with the conversation
      navigate(`/chat/${data}`);
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      toast({
        title: "Error",
        description: err.message || 'Could not start conversation. Please try again later.',
        variant: "destructive"
      });
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error || 'Book not found'}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{book.title} | BookCircuit</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book cover */}
            <div className="md:col-span-1">
              <div className="rounded-lg overflow-hidden border shadow-md aspect-[2/3] bg-gray-100">
                {book.cover_img_url ? (
                  <img 
                    src={book.cover_img_url} 
                    alt={`Cover of ${book.title}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <BookOpen size={64} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Owner info and contact button on mobile */}
              <div className="mt-6 block md:hidden">
                <OwnerCard 
                  owner={book.owner} 
                  isOwnBook={user?.id === book.owner.id} 
                  onContactClick={startConversation}
                  loading={startingChat}
                />
              </div>
            </div>
            
            {/* Book details */}
            <div className="md:col-span-2">
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <h2 className="text-xl text-gray-600 mb-4">by {book.author}</h2>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary" className="text-sm">
                  Condition: {book.condition}
                </Badge>
                
                <Badge variant="outline" className="text-sm flex items-center">
                  <MapPin size={14} className="mr-1" /> {book.location_text}
                </Badge>
                
                <Badge variant="outline" className="text-sm flex items-center">
                  <Calendar size={14} className="mr-1" /> 
                  Listed {new Date(book.created_at).toLocaleDateString()}
                </Badge>
                
                {book.isbn && (
                  <Badge variant="outline" className="text-sm">
                    ISBN: {book.isbn}
                  </Badge>
                )}
              </div>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {book.description || 'No description provided.'}
                  </p>
                </CardContent>
              </Card>
              
              {/* Owner info on desktop */}
              <div className="hidden md:block">
                <OwnerCard 
                  owner={book.owner} 
                  isOwnBook={user?.id === book.owner.id} 
                  onContactClick={startConversation}
                  loading={startingChat}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Owner info card component
interface OwnerCardProps {
  owner: BookDetails['owner'];
  isOwnBook: boolean;
  onContactClick: () => void;
  loading: boolean;
}

const OwnerCard = ({ owner, isOwnBook, onContactClick, loading }: OwnerCardProps) => {
  if (!owner) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Owner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-4">
            {owner.avatar_url ? (
              <img 
                src={owner.avatar_url} 
                alt={owner.full_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white">
                {owner.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium">{owner.full_name}</h3>
            <p className="text-sm text-gray-500">Book owner</p>
          </div>
        </div>
        
        {isOwnBook ? (
          <Button variant="outline" disabled className="w-full">
            This is your book
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onContactClick}
            disabled={loading}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {loading ? 'Starting Chat...' : 'Contact Owner'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BookDetail; 