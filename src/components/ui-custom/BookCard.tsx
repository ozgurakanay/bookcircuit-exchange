import React from 'react';
import { Book } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, MapPin, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteBook } from '@/lib/bookService';

interface BookCardProps {
  book: Book;
  onDelete?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onDelete }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = React.useState(false);

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

  // Handle edit book
  const handleEdit = () => {
    navigate(`/edit-book/${book.id}`);
  };

  // Handle delete book
  const handleDelete = async () => {
    if (confirm('Are you sure you want to remove this book?')) {
      setDeleting(true);
      try {
        await deleteBook(book.id);
        toast.success('Book removed successfully');
        if (onDelete) onDelete();
      } catch (error) {
        console.error('Error deleting book:', error);
        toast.error('Failed to remove book');
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow relative">
      {/* Action menu */}
      <div className="absolute top-2 right-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/20 hover:bg-black/40 text-white rounded-full">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Removing...' : 'Remove'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
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
      
      <CardFooter className="pt-0 text-sm text-muted-foreground">
        <div className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          <span className="line-clamp-1">{book.location_text}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookCard; 