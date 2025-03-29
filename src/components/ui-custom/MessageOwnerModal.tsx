import React, { useState } from 'react';
import { Book } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { X, Send } from 'lucide-react';

interface MessageOwnerModalProps {
  book: Book;
  ownerName: string;
  isOpen: boolean;
  onClose: () => void;
  onSendComplete: (conversationId: string) => void; // Optional: Callback after sending
}

export const MessageOwnerModal: React.FC<MessageOwnerModalProps> = ({
  book,
  ownerName,
  isOpen,
  onClose,
  onSendComplete
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.warning('Please enter a message.');
      return;
    }
    if (!book.user_id) {
        toast.error('Cannot determine the book owner.');
        return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase
        .rpc('start_conversation', {
          other_user_id: book.user_id,
          initial_message: message.trim(),
          book_id: book.id
        });

      if (error) throw error;

      toast.success('Message sent successfully!');
      setMessage(''); // Clear message input
      onClose(); // Close the modal
      if (onSendComplete && data) {
        onSendComplete(data); // Pass conversation ID back if needed
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Use Dialog component for modal structure
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message {ownerName}</DialogTitle>
          <div className="flex items-center space-x-3 pt-4 border-b pb-4 mb-4">
            <img
              src={book.cover_img_url || '/placeholder-book.png'}
              alt={book.title}
              className="h-16 w-auto object-contain rounded"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-book.png'; }}
            />
            <div>
              <p className="font-semibold">{book.title}</p>
              {book.author && <p className="text-sm text-muted-foreground">by {book.author}</p>}
            </div>
          </div>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Textarea
            placeholder={`Type your message to ${ownerName} about "${book.title}"...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            disabled={isSending}
          />
        </div>
        
        <DialogFooter>
           <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
          </DialogClose>
          <Button type="button" onClick={handleSendMessage} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Message'}
            {!isSending && <Send className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 