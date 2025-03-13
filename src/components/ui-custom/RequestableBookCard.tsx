import React, { useState } from 'react';
import { Book } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MapPin, User, MessageSquare, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { requestBook } from '@/lib/bookService';
import { useAuth } from '@/context/AuthContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RequestableBookCardProps {
  book: Book;
  ownerName?: string;
  className?: string;
  onRequest?: () => void;
}

const RequestableBookCard: React.FC<RequestableBookCardProps> = ({ 
  book, 
  ownerName, 
  className = '',
  onRequest 
}) => {
  const { user } = useAuth();
  const [requesting, setRequesting] = useState(false);

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
    try {
      const result = await requestBook(book.id, user.id);
      
      if (result.success) {
        toast.success('Book requested successfully');
        if (onRequest) onRequest();
      } else {
        toast.error(result.error || 'Failed to request book');
      }
    } catch (error) {
      console.error('Error requesting book:', error);
      toast.error('Failed to request book');
    } finally {
      setRequesting(false);
    }
  };

  return (
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
            <span className="line-clamp-1">{book.location_text}</span>
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
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-1" 
            onClick={handleRequest}
            disabled={requesting}
          >
            {requesting ? 'Requesting...' : 'Request Book'}
            <MessageSquare className="ml-1 h-4 w-4" />
          </Button>
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
  );
};

export default RequestableBookCard; 