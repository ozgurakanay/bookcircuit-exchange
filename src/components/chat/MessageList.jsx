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
    <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto bg-background space-y-4 relative">
      {/* Button to load older messages */} 
      <div className="flex justify-center sticky top-1 z-10">
        {hasMore && (
          <button 
            onClick={onLoadOlder}
            disabled={loading} // Disable while loading
            className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground rounded-full px-3 py-1 shadow-sm disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Older Messages'}
          </button>
        )}
      </div>

      {messages.length === 0 && !loading ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      ) : (
        <>
          {/* Iterate over sorted groups */}
          {Object.entries(messageGroups).map(([dateString, messagesInGroup]) => (
            <div key={dateString}>
              {/* Use formatGroupDateCET for display */}
              <div className="flex justify-center my-3 sticky top-10 z-10 py-1"> {/* Adjusted sticky top */} 
                <span className="text-xs bg-muted text-muted-foreground rounded-full px-3 py-1 shadow-sm">
                  {formatGroupDateCET(dateString)}
                </span>
              </div>
              
              {messagesInGroup.map(message => {
                // REMOVED console log for less noise
                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwnMessage={message.user_id === currentUserId}
                  />
                );
              })}
            </div>
          ))}
          
          {/* Empty div for scrolling to the bottom */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList; 