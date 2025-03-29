import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import { formatDateCETForGrouping, formatGroupDateCET } from '@/lib/dateUtils';

/**
 * MessageList component displays all messages in a conversation
 * @param {Object} props
 * @param {string} props.currentUserId - ID of the current user
 * @param {Array} props.messages - Array of message objects
 * @param {boolean} props.loading - Whether messages are loading
 * @param {Function} props.onLoadOlder - Function to load older messages
 * @param {boolean} props.hasMore - Whether there are more older messages to load
 */
const MessageList = ({ 
  currentUserId, 
  messages = [], 
  loading = false, 
  onLoadOlder, 
  hasMore 
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Scroll to the bottom whenever messages change, unless already scrolled up
  useEffect(() => {
    // If new messages were added, scroll to bottom
    // Logic might need refinement for prepended messages
    // For now, assume new message = scroll to bottom
    const container = messagesContainerRef.current;
    if (container) {
        // Simple check: if scrolled near bottom, maintain position
        // Otherwise, assume user scrolled up and don't auto-scroll
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
        if (isNearBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
  }, [messages]);

  // Group messages by date using CET formatter
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const dateString = formatDateCETForGrouping(message.created_at);
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      groups[dateString].push(message);
    });
    
    // Ensure groups are sorted chronologically by date string
    const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
      // Convert formatted date string back to Date for sorting (or sort based on first message time)
      // This is a bit inefficient, ideally sort keys before grouping if dates aren't naturally ordered
      return new Date(messages.find(m => formatDateCETForGrouping(m.created_at) === a).created_at) - 
             new Date(messages.find(m => formatDateCETForGrouping(m.created_at) === b).created_at);
    });

    const sortedGroups = {};
    sortedGroupKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto bg-white space-y-2 relative">
      {/* Button to load older messages */}
      <div className="flex justify-center sticky top-2 z-10 py-1">
        {hasMore && (
          <button
            onClick={onLoadOlder}
            disabled={loading}
            className="text-xs bg-white hover:bg-gray-100 text-blue-600 font-medium rounded-full px-4 py-1.5 shadow-sm disabled:opacity-50 border border-gray-200 transition-colors duration-150"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : (
              'Load Older Messages'
            )}
          </button>
        )}
      </div>

      {messages.length === 0 && !loading ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <>
          {Object.entries(messageGroups).map(([dateString, messagesInGroup]) => (
            <div key={dateString} className="relative py-2">
              {/* Date separator */}
              <div className="flex justify-center my-2 sticky top-12 z-10">
                <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-3 py-1 shadow-sm border border-gray-200">
                  {formatGroupDateCET(dateString)}
                </span>
              </div>

              <div className="space-y-2">
                {messagesInGroup.map(message => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwnMessage={message.user_id === currentUserId}
                  />
                ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList; 