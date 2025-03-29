/**
 * MessageItem component displays a single message
 * @param {Object} props
 * @param {Object} props.message - The message data from Supabase
 * @param {boolean} props.isOwnMessage - Whether this message was sent by the current user
 */
import { formatTimeCET } from '@/lib/dateUtils'; // Import new util
import { CheckCheck } from 'lucide-react'; // Import the icon

const MessageItem = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Message bubble */}
        <div 
          className={`px-3 py-2 rounded-lg shadow-sm ${
            isOwnMessage 
              ? 'bg-primary text-primary-foreground rounded-tr-none' 
              : 'bg-card border border-border text-card-foreground rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
          
          {/* Remove attachment logic */}
          {/* 
          {message.attachments && Object.keys(message.attachments).length > 0 && (
            <div className="mt-2">
              <span className="text-xs italic">
                {isOwnMessage ? 'Attachment sent' : 'Attachment received'}
              </span>
            </div>
          )} 
          */}
        </div>
        
        {/* Timestamp and status */}
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <span>{formatTimeCET(message.created_at)}</span>
          
          {/* Remove edited logic */}
          {/* 
          {message.is_edited && (
            <span className="ml-2">(edited)</span>
          )} 
          */}
          
          {isOwnMessage && (
            <CheckCheck className="ml-1.5 h-4 w-4 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 