import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/lib/supabase';
import ChatContainer from '../components/chat/ChatContainer';
import Navbar from '@/components/ui-custom/Navbar';
import Footer from '@/components/ui-custom/Footer';
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Chat = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const checkAccess = async () => {
      setLoading(true);
      try {
        // If no conversationId is provided, just show all conversations
        if (!conversationId) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        // Check if user is a participant in this conversation
        const { data, error } = await supabase
          .from('conversation_participants')
          .select('*')
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id);

        if (error) throw error;

        // User has access if they are a participant
        setHasAccess(data && data.length > 0);
      } catch (err) {
        console.error('Error checking conversation access:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, conversationId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!hasAccess && conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-6">
          You don't have access to this conversation or it doesn't exist.
        </p>
        <Button onClick={() => navigate('/chat')}>Go to My Conversations</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Chat | BookCircuit</title>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
              <Button
                variant="ghost"
                className="p-0 mr-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            
            <ChatContainer userId={user?.id} selectedConversationId={conversationId} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat; 