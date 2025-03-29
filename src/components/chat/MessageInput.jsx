import { useState, useRef, useEffect } from 'react';
import { Paperclip, Smile, Send, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

/**
 * MessageInput component for sending new messages
 * @param {Object} props
 * @param {Function} props.onSendMessage - Function to call with new message content
 * @param {string} props.conversationId - ID of the current conversation
 */
const MessageInput = ({ onSendMessage, conversationId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fileAttachment, setFileAttachment] = useState(null);
  const [bookDetails, setBookDetails] = useState(null);
  const [loadingBook, setLoadingBook] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0);
  const textareaRef = useRef(null);

  // Check if this is the first message in the conversation
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!conversationId) return;
      
      try {
        // Get conversation details to check for book_id
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('book_id')
          .eq('id', conversationId)
          .single();
          
        if (convError) throw convError;
        
        // Get messages count
        const { count, error: countError } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('conversation_id', conversationId);
          
        if (countError) throw countError;
        
        setMessagesCount(count || 0);
        
        // If there's a book_id, fetch book details
        if (conversation?.book_id) {
          setLoadingBook(true);
          const { data: book, error: bookError } = await supabase
            .from('books')
            .select('id, title, author, cover_img_url')
            .eq('id', conversation.book_id)
            .single();
            
          if (bookError) throw bookError;
          
          setBookDetails(book);
          
          // If this is the first message, suggest a template
          if (count === 0) {
            setMessage(`Hi, I'm interested in your book "${book.title}"! Is it still available?`);
          }
        }
      } catch (err) {
        console.error('Error fetching conversation details:', err);
      } finally {
        setLoadingBook(false);
      }
    };
    
    fetchConversationDetails();
  }, [conversationId]);

  // Auto-resize the textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChangeMessage = (e) => {
    setMessage(e.target.value);
    
    // Set typing indicator
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      // In real implementation, you'd broadcast the typing status to other users
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      // In real implementation, clear the typing status
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && onSendMessage) {
      onSendMessage(trimmedMessage);
      setMessage('');
      setIsTyping(false);
      // Explicitly focus the textarea after sending to prevent focus jumps
      textareaRef.current?.focus();
    }
  };

  const useBookTemplate = () => {
    if (bookDetails) {
      setMessage(`Hi, I'm interested in your book "${bookDetails.title}"! Is it still available?`);
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="p-3 py-2 border-t border-border bg-card">
      {/* Book template for first message */}
      {messagesCount === 0 && bookDetails && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center mb-2">
            <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-700">New conversation about a book</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-10 h-12 bg-gray-100 rounded overflow-hidden mr-3">
              {bookDetails.cover_img_url ? (
                <img 
                  src={bookDetails.cover_img_url} 
                  alt={bookDetails.title}
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-medium line-clamp-1">{bookDetails.title}</h4>
              {bookDetails.author && (
                <p className="text-xs text-gray-500 line-clamp-1">by {bookDetails.author}</p>
              )}
            </div>
            
            <button 
              className="ml-2 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
              onClick={useBookTemplate}
            >
              Use template
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Message textarea */}
        <textarea
          ref={textareaRef}
          className="flex-1 w-full border border-input bg-background rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
          placeholder="Type a message..."
          value={message}
          onChange={handleChangeMessage}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={2000}
        />
        
        {/* Send button - Simplified disabled condition */}
        <button
          className={`p-2 rounded-full ${
            message.trim()
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      {/* Character count */}
      {message.length > 1500 && (
        <div className="text-xs text-right mt-1 text-gray-500">
          {message.length}/2000
        </div>
      )}
    </div>
  );
};

export default MessageInput; 