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
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} p-1.5`}>
      <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isOwnMessage ? 'items-end' : 'items-start'} p-1.5 rounded-lg bg-gray-50`}>
        {/* Message bubble */}
        <div
          className={`px-3 py-2 rounded-lg shadow-sm text-sm break-words ${
            isOwnMessage
              ? 'bg-accent text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          
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
        <div className="flex items-center mt-1 text-xs text-gray-400">
          <span>{formatTimeCET(message.created_at)}</span>
          
          {/* Remove edited logic */}
          {/* 
          {message.is_edited && (
            <span className="ml-2">(edited)</span>
          )} 
          */}
          
          {isOwnMessage && (
            <CheckCheck className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 