import React, { useState, useEffect } from 'react';
import { Book } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MapPin, User, MessageSquare, Navigation, MessageCircle, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { requestBook, cancelBookRequest } from '@/lib/bookService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageOwnerModal } from './MessageOwnerModal';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RequestableBookCardProps {
  book: Book;
  ownerName?: string;
  className?: string;
  onRequest?: () => void;
}

const RequestableBookCard: React.FC<RequestableBookCardProps> = ({ 
  book, 
  ownerName = "Owner",
  className = '',
  onRequest 
}) => {
  const { user } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [justRequestedId, setJustRequestedId] = useState<string | null>(null);
  const [existingRequestId, setExistingRequestId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const realtimeSubscriptionRef = React.useRef<RealtimeChannel | null>(null);

  // Setup real-time subscription for book requests
  useEffect(() => {
    // Only set up subscription if we have a user and a book
    if (!user || !book.id) return;
    
    // Clean up existing subscription if any
    if (realtimeSubscriptionRef.current) {
      supabase.removeChannel(realtimeSubscriptionRef.current);
      realtimeSubscriptionRef.current = null;
    }
    
    console.log(`[RequestableBookCard] Setting up real-time subscription for book: ${book.id}`);
    
    const channel = supabase
      .channel(`book_request:${book.id}:${user.id}`) // Unique channel name
      .on('postgres_changes', {
        event: '*', // All events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'book_requests',
        filter: `book_id=eq.${book.id} AND requester_id=eq.${user.id}`, // Corrected AND syntax
      }, (payload) => {
        console.log(`[RequestableBookCard] Received real-time event for book ${book.id}:`, payload);
        
        // Handle different event types
        if (payload.eventType === 'DELETE') {
          // Request was deleted
          setIsRequested(false);
          setJustRequestedId(null);
          setExistingRequestId(null);
        } else if (payload.eventType === 'INSERT') {
          // New request was created
          setIsRequested(true);
          setExistingRequestId(payload.new.id);
        } else if (payload.eventType === 'UPDATE') {
          // Request was updated (e.g., status change)
          setIsRequested(true);
          setExistingRequestId(payload.new.id);
        }
      })
      .subscribe();
    
    realtimeSubscriptionRef.current = channel;
    
    // Clean up function
    return () => {
      if (realtimeSubscriptionRef.current) {
        console.log(`[RequestableBookCard] Cleaning up real-time subscription for book: ${book.id}`);
        supabase.removeChannel(realtimeSubscriptionRef.current);
      }
    };
  }, [user?.id, book.id]); // Re-run if user or book changes

  // Check if the user has already requested this book
  useEffect(() => {
    const checkIfRequested = async () => {
      if (!user) return;
      
      // Reset IDs before check
      setJustRequestedId(null);
      setExistingRequestId(null);

      try {
        const { data, error } = await supabase
          .from('book_requests')
          .select('id') // Select only the ID
          .eq('book_id', book.id)
          .eq('requester_id', user.id)
          .maybeSingle(); // Use maybeSingle to handle null case gracefully
        
        if (error) {
          // Don't throw, just log and assume not requested
          console.error('[RequestableBookCard] Error checking for existing request:', error);
          setIsRequested(false);
        } else if (data) {
          // Request exists
          setIsRequested(true);
          setExistingRequestId(data.id); // Store the existing request ID
        } else {
          // No request exists
          setIsRequested(false);
        }
      } catch (error) {
        // Catch any unexpected error during the check
        console.error('[RequestableBookCard] Unexpected error checking request:', error);
        setIsRequested(false);
      }
    };
    
    // Reset all state on user/book change before check
    setIsRequested(false);
    setJustRequestedId(null);
    setExistingRequestId(null);
    setCancelling(false); 
    if (user && book.id) {
        checkIfRequested();
    }
  }, [book.id, user]);

  // Function to get condition color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'bg-green-500';
      case 'Like New':
        return 'bg-emerald-500';
      case 'Good':
        return 'bg-blue-500';
      case 'Fair':
        return 'bg-yellow-500';
      case 'Poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Handle request book
  const handleRequest = async () => {
    if (!user) {
      toast.error('You must be logged in to request books');
      return;
    }

    if (user.id === book.user_id) {
      toast.error('You cannot request your own book');
      return;
    }

    setRequesting(true);
    setJustRequestedId(null);
    setExistingRequestId(null);
    try {
      const result = await requestBook(book.id, user.id);
      
      if (result.success && result.requestId) {
        toast.success('Book requested successfully');
        setIsRequested(true);
        setJustRequestedId(result.requestId);
        if (onRequest) onRequest();
      } else {
        toast.error(result.error || 'Failed to request book');
        setIsRequested(false);
        setJustRequestedId(null);
      }
    } catch (error: any) {
      console.error('Error requesting book:', error);
      toast.error(error?.message || 'Failed to request book');
      setIsRequested(false);
      setJustRequestedId(null);
    } finally {
      setRequesting(false);
    }
  };

  // Handle cancel request
  const handleCancelRequest = async () => {
    // Determine which ID to use: the one just created or the pre-existing one
    const requestIdToCancel = justRequestedId || existingRequestId;

    if (!user || !requestIdToCancel) {
      toast.error('Cannot cancel request - request ID not found or user not logged in.');
      return;
    }

    setCancelling(true);
    try {
      // Pass the determined ID to the service function
      const result = await cancelBookRequest(requestIdToCancel, user.id);

      if (result.success) {
        toast.success('Book request cancelled');
        setIsRequested(false);
        setJustRequestedId(null); // Clear both possible ID states
        setExistingRequestId(null);
      } else {
        toast.error(result.error || 'Failed to cancel request');
      }
    } catch (error: any) {
      console.error('Error cancelling request:', error);
      toast.error(error?.message || 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenMessageModal = () => {
    if (!user) {
      toast.error('You must be logged in to message book owners');
      return;
    }
    if (user.id === book.user_id) {
      toast.error('You cannot message yourself');
      return;
    }
    setIsMessageModalOpen(true);
  };

  return (
    <>
      <Card className={`h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow relative ${className}`}>
        <div className="relative pt-[60%] bg-muted">
          {book.cover_img_url ? (
            <img
              src={book.cover_img_url}
              alt={book.title}
              className="absolute inset-0 w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-book.png';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <BookOpen className="h-16 w-16 text-muted-foreground opacity-20" />
            </div>
          )}
          <Badge 
            className={`absolute bottom-2 left-2 ${getConditionColor(book.condition)}`}
          >
            {book.condition}
          </Badge>
          
          {isRequested && (
            <Badge className="absolute top-2 right-2 bg-blue-500">
              Requested
            </Badge>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
          {book.author && (
            <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
          )}
        </CardHeader>
        
        <CardContent className="pb-2 flex-grow">
          {book.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {book.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 flex flex-col items-start gap-2 w-full">
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span className="line-clamp-1">{book.postal_code || book.location_text}</span>
            </div>
            
            {ownerName && (
              <div className="flex items-center ml-auto">
                <User className="h-3.5 w-3.5 mr-1" />
                <span className="line-clamp-1">{ownerName}</span>
              </div>
            )}
          </div>
          
          {/* Display distance if available */}
          {book.distance_km !== undefined && (
            <div className="flex items-center justify-start w-full text-sm">
              <Navigation className="h-3.5 w-3.5 mr-1 text-blue-500" />
              <span className="text-blue-600 font-medium">
                {book.distance_km < 1 
                  ? `${Math.round(book.distance_meters || 0)} meters away` 
                  : `${book.distance_km.toFixed(1)} km away`}
              </span>
            </div>
          )}
          
          {user && user.id !== book.user_id && (
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              {!isRequested ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-9 px-2 text-xs sm:text-sm flex items-center justify-center"
                  onClick={handleRequest}
                  disabled={requesting}
                >
                  {requesting ? 'Requesting...' : 'Request Book'}
                  <MessageSquare className="ml-1 h-4 w-4 flex-shrink-0" />
                </Button>
              ) : (
                 <Button 
                  variant="destructive"
                  size="sm" 
                  className="w-full h-9 px-2 text-xs sm:text-sm flex items-center justify-center"
                  onClick={handleCancelRequest}
                  disabled={cancelling || requesting}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Request'}
                  <XCircle className="ml-1 h-4 w-4 flex-shrink-0" /> 
                </Button>
              )}
              
              <Button 
                variant="default" 
                size="sm"
                className="w-full h-9 px-2 text-xs sm:text-sm flex items-center justify-center"
                onClick={handleOpenMessageModal}
              >
                Message Owner
                <MessageCircle className="ml-1 h-4 w-4 flex-shrink-0" />
              </Button>
            </div>
          )}
          
          {user && user.id === book.user_id && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mt-1 opacity-50 cursor-not-allowed"
                    disabled={true}
                  >
                    Your Book
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>You cannot request your own book</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardFooter>
      </Card>

      {book && ownerName && (
        <MessageOwnerModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          book={book}
          ownerName={ownerName}
          onSendComplete={(conversationId) => {
            console.log('Message sent, conversation ID:', conversationId);
          }}
        />
      )}
    </>
  );
};

export default RequestableBookCard; 