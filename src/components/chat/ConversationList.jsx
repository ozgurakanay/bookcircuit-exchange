import { useState } from 'react';
import { formatRelativeTimeCET } from '@/lib/dateUtils';
import { CheckCheck } from 'lucide-react';

/**
 * ConversationList component to display all conversations
 * @param {Object} props
 * @param {Array} props.conversations - List of conversation objects
 * @param {string} props.selectedConversationId - ID of the currently selected conversation
 * @param {Function} props.onSelectConversation - Function to call when a conversation is selected
 * @param {boolean} props.loading - Indicates if the component is loading
 * @param {string} props.currentUserId - ID of the current user
 */
const ConversationList = ({ conversations, selectedConversationId, onSelectConversation, loading, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(
    convo => convo.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
     return (
      <div className="flex-1 overflow-y-auto p-4">
         {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-3 mb-2 animate-pulse">
               <div className="w-12 h-12 rounded-full bg-gray-300 mr-3"></div>
               <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-1.5"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
               </div>
            </div>
         ))}
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search bar */}
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full p-2 rounded-md border bg-card focus:outline-none focus:ring-1 focus:ring-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <ul>
            {filteredConversations.map((conversation) => (
              <li 
                key={conversation.id}
                className={`flex items-center p-3 border-b border-border cursor-pointer hover:bg-muted ${
                  selectedConversationId === conversation.id ? 'bg-muted font-semibold' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                {/* Use Avatar if available, otherwise placeholder */}
                {conversation.avatar ? (
                   <img src={conversation.avatar} alt={conversation.name} className="w-10 h-10 rounded-full mr-4 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted-foreground/30 flex items-center justify-center text-muted-foreground font-medium mr-4">
                    {conversation.name ? conversation.name.charAt(0).toUpperCase() : '-'}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium truncate">{conversation.name}</h3>
                    {/* Use new formatRelativeTimeCET */}
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatRelativeTimeCET(conversation.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {conversation.last_message_sender_id === currentUserId && (
                      <CheckCheck className="h-4 w-4 mr-1 text-primary flex-shrink-0" />
                    )}
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
                
                {/* Unread badge - logic might need adjustment based on last_read_at */}
                {conversation.unreadCount > 0 && (
                  <div className="ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
            No conversations found.
          </div>
        )}
      </div>
      
      {/* Remove New conversation button for now */}
      {/* 
      <div className="p-4 border-t border-gray-200">
        <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
          New Chat
        </button>
      </div> 
      */}
    </div>
  );
};

export default ConversationList; 