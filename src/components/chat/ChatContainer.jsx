import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase'; // Corrected import path
import ConversationList from './ConversationList';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MESSAGES_PER_PAGE = 30; // Define page size

/**
 * Main container for the chat feature
 * @param {Object} props
 * @param {string} props.userId - The current user's ID
 * @param {string} props.selectedConversationId - Optional ID of a specific conversation to load
 */
const ChatContainer = ({ userId, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messagePage, setMessagePage] = useState(0); // State for current message page
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // State to track if more messages exist
  const navigate = useNavigate();

  // Fetch all conversations the user participates in
  useEffect(() => {
    const fetchConversations = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const { data: participations, error: participationsError } = await supabase
          .from('conversation_participants')
          .select('conversation_id, last_read_at')
          .eq('user_id', userId);
        
        if (participationsError) throw participationsError;
        
        if (participations && participations.length > 0) {
          const conversationIds = participations.map(p => p.conversation_id);
          
          const { data: conversationsData, error: conversationsError } = await supabase
            .from('conversations')
            .select(`
              id, 
              created_at, 
              last_message, 
              last_message_at, 
              last_message_sender_id,
              book_id,
              conversation_participants!inner(user_id)
            `)
            .in('id', conversationIds)
            .order('last_message_at', { ascending: false });
          
          if (conversationsError) throw conversationsError;

          // Correctly fetch ALL relevant participants for ALL conversations
          const { data: participantsData, error: participantsError } = await supabase
            .from('conversation_participants')
            .select('user_id, conversation_id') // Select both user_id and conversation_id
            .in('conversation_id', conversationIds); // Use 'in' to fetch for all conversation IDs
            // We fetch all participants including the current user, and filter later
          
          if (participantsError) {
            console.error(`Error fetching participants for convos ${conversationIds.join(', ')}`, participantsError);
            return;
          }

          const user = await supabase.auth.getUser().then(res => res.data.user);

          // Map over conversations to enhance them
          const enhancedConversations = await Promise.all(
            conversationsData.map(async (conversation) => {
              // Filter participants for THIS specific conversation
              const participationsForThisConvo = participantsData.filter(
                (p) => p.conversation_id === conversation.id
              );
              // Filter out the current user to find others
              const otherParticipants = participationsForThisConvo.filter(
                (p) => p.user_id !== user.id
              );

              if (otherParticipants.length === 0) {
                // console.warn(`[ChatContainer] No other participants found for convo ${conversation.id}`);
                return { ...conversation, name: 'Empty Chat', avatar: null, unreadCount: 0 };
              }

              // Get the ID of the first other participant
              const firstOtherUserId = otherParticipants[0].user_id;

              // 1. Fetch Avatar & Full Name from profiles table
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id, avatar_url, full_name') // Select avatar and full name
                .eq('id', firstOtherUserId)
                .maybeSingle(); // Use maybeSingle as profile might not exist
              
              if (profileError) {
                console.error(`Error fetching profile for user ${firstOtherUserId}`, profileError);
                // Continue, but avatar/fallback name might be missing
              }

              // 2. Call the RPC function to get email
              const { data: emailData, error: rpcError } = await supabase.rpc(
                'get_user_email', // Use the new function name
                { user_id_input: firstOtherUserId }
              );

              if (rpcError) {
                console.error(`Error calling get_user_email RPC for user ${firstOtherUserId}`, rpcError);
                // Continue, but will use profile full_name as fallback
              }
              
              // Extract email from RPC response (returns array)
              const userEmail = emailData && emailData.length > 0 ? emailData[0]?.email : null;
              console.log(`[ChatContainer] Fetched for ${firstOtherUserId}:`, { profileData, userEmail }); // Combined log

              // Calculate unread count (logic remains the same)
              const participation = participationsForThisConvo.find(p => p.conversation_id === conversation.id && p.user_id === user.id);
              let unreadCount = 0;
              if (participation && participation.last_read_at) {
                const lastReadDate = new Date(participation.last_read_at);
                // Count messages AFTER last_read_at NOT sent by the current user
                const { data: unreadMessagesCount, error: unreadError } = await supabase
                  .from('messages')
                  .select('id', { count: 'exact', head: true })
                  .eq('conversation_id', conversation.id)
                  .neq('user_id', user.id) // CORRECTED: use user_id
                  .gt('created_at', lastReadDate.toISOString()); 

                if (unreadError) {
                  console.error(`Error fetching unread count for ${conversation.id}:`, unreadError);
                } else {
                  unreadCount = unreadMessagesCount || 0; 
                }
               } else if (!participation || !participation.last_read_at) {
                 // If never read, count ALL messages not sent by the user
                 const { data: totalMessagesCount, error: totalError } = await supabase 
                  .from('messages')
                  .select('id', { count: 'exact', head: true })
                  .eq('conversation_id', conversation.id)
                  .neq('user_id', user.id); // CORRECTED: use user_id
                  
                  if (totalError) {
                     console.error(`Error fetching total unread count for ${conversation.id}:`, totalError);
                  } else {
                     unreadCount = totalMessagesCount || 0;
                  }
               }

              // Enhance the conversation
              const enhanced = {
                ...conversation,
                // Use email if available, otherwise fallback to profile full_name, then 'Unknown'
                name: userEmail || profileData?.full_name || 'Unknown User',
                // Use avatar_url from profile data
                avatar: profileData?.avatar_url || null,
                unreadCount,
                last_message_sender_id: conversation.last_message_sender_id 
              };
              console.log(`[ChatContainer] Enhanced conversation ${conversation.id}:`, enhanced);
              return enhanced;
            })
          );

          // console.log('[ChatContainer] Final Enhanced Conversations:', enhancedConversations);

          setConversations(enhancedConversations);
          
          if (selectedConversationId) {
            const conversation = enhancedConversations.find(c => c.id === selectedConversationId);
            if (conversation) {
              setSelectedConversation(conversation);
            }
          } 
          else if (!selectedConversation && enhancedConversations.length > 0) {
            setSelectedConversation(enhancedConversations[0]);
          }
        } else {
          setConversations([]);
        }
      } catch (error) {
        console.error('[ChatContainer] Error fetching conversations overall:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchConversations();
      
      const conversationsSubscription = supabase
        .channel('public:conversation_participants')
        .on(
          'postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'conversation_participants',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            fetchConversations();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(conversationsSubscription);
      };
    }
  }, [userId, selectedConversationId]);

  // --- Function to fetch messages with pagination --- 
  const fetchMessages = useCallback(async (conversationId, page, shouldPrepend = false) => {
    if (!userId || !conversationId) return;

    setMessageLoading(true);
    try {
      const from = page * MESSAGES_PER_PAGE;
      const to = from + MESSAGES_PER_PAGE - 1;

      console.log(`[ChatContainer] Fetching messages page ${page} (range ${from}-${to}) for convo ${conversationId}`);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, created_at, user_id, conversation_id')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false }) // Fetch latest first
        .range(from, to);

      if (messagesError) throw messagesError;

      const fetchedMessages = messagesData || [];
      console.log(`[ChatContainer] Fetched ${fetchedMessages.length} messages.`);

      // Reverse to maintain chronological order in UI
      const orderedMessages = fetchedMessages.reverse(); 

      setMessages(prev => 
        shouldPrepend ? [...orderedMessages, ...prev] : orderedMessages
      );
      
      // Update hasMoreMessages based on fetched count
      setHasMoreMessages(fetchedMessages.length === MESSAGES_PER_PAGE);
      
      // If it's the initial fetch (page 0), mark as read
      if (page === 0) {
          await supabase
            .from('conversation_participants')
            .update({ last_read_at: new Date().toISOString() })
            .eq('conversation_id', conversationId)
            .eq('user_id', userId);
      }

    } catch (error) {
      console.error(`Error fetching messages page ${page}:`, error);
    } finally {
      setMessageLoading(false);
    }
  }, [userId]); // Include dependencies
  // --- End fetchMessages function --- 

  // Effect to load initial messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setMessagePage(0); // Reset page number
      setHasMoreMessages(true); // Assume there are messages initially
      setMessages([]); // Clear old messages
      fetchMessages(selectedConversation.id, 0, false); // Fetch page 0
    }
  }, [selectedConversation, fetchMessages]); // Depend on selectedConversation and fetchMessages

  // --- Real-time subscription for new messages --- 
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', // Only listen for new messages here
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => { 
          console.log('[Realtime] INSERT received:', payload.new);
          // Check if message already exists in state (to avoid duplicates if fetch was fast)
          setMessages(prev => {
              if (prev.some(msg => msg.id === payload.new.id)) {
                  return prev; // Already exists, do nothing
              }
              // Append the new message to the end
              return [...prev, payload.new]; 
          });
          
          // Mark as read if message is not from current user
          if (payload.new.user_id !== userId) {
            supabase
              .from('conversation_participants')
              .update({ last_read_at: new Date().toISOString() })
              .eq('conversation_id', selectedConversation.id)
              .eq('user_id', userId);
          }
        }
      )
      // Add handlers for UPDATE/DELETE if needed
      .subscribe();

    return () => {
      console.log(`[Realtime] Cleaning up subscription for convo: ${selectedConversation?.id}`);
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, userId]); // Depend on selectedConversation and userId
  // --- End real-time subscription --- 

  // --- Function to load older messages --- 
  const handleLoadOlderMessages = useCallback(() => {
    if (!messageLoading && hasMoreMessages && selectedConversation) {
      const nextPage = messagePage + 1;
      setMessagePage(nextPage);
      fetchMessages(selectedConversation.id, nextPage, true); // Fetch next page and prepend
    }
  }, [messageLoading, hasMoreMessages, selectedConversation, messagePage, fetchMessages]);
  // --- End load older messages --- 

  const handleSelectConversation = async (conversation) => {
    // console.log("[ChatContainer] Selecting conversation:", conversation);
    // Only set the selected conversation. Initial fetch handles messages & marking read.
    if (selectedConversation?.id !== conversation.id) {
      setSelectedConversation(conversation);
    }
    
    // Optimistically update UI for unread count immediately
    if (conversation.unreadCount > 0) {
        setConversations(prevConversations => 
          prevConversations.map(convo => 
            convo.id === conversation.id ? { ...convo, unreadCount: 0 } : convo
          )
        );
    }
  };

  const handleSendMessage = async (messageContent) => {
    if (!selectedConversation || !messageContent.trim() || !userId) return;

    const messageData = {
      conversation_id: selectedConversation.id,
      user_id: userId,
      content: messageContent.trim(),
    };

    try {
      // Insert new message into the database
      const { data: insertedMessages, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(); // Select to get the inserted message back

      if (error) throw error;
      
      // --- Optimistic UI Update for Conversation List ---
      if (insertedMessages && insertedMessages.length > 0) {
        const newMessage = insertedMessages[0];
        setConversations(prevConversations => {
          const updatedConversationIndex = prevConversations.findIndex(c => c.id === selectedConversation.id);
          
          if (updatedConversationIndex === -1) {
            // Should not happen if conversation is selected, but handle defensively
            return prevConversations; 
          }

          // Create the updated conversation object
          const updatedConversation = {
            ...prevConversations[updatedConversationIndex],
            last_message: newMessage.content,
            last_message_at: newMessage.created_at,
            last_message_sender_id: userId, // We know the current user sent it
            // Optionally update unreadCount if needed locally, though depends on read status logic
          };
          
          // Remove the old conversation and add the updated one to the top
          const otherConversations = prevConversations.filter(c => c.id !== selectedConversation.id);
          return [updatedConversation, ...otherConversations];
        });
      }
      // --- End Optimistic Update ---

      // Real-time subscription for messages will handle adding it to the MessageList

    } catch (error) {
      console.error('Error sending message:', error);
      // Consider adding toast notification for error
    }
  };

  const startNewConversation = async (otherUserId, initialMessage = null, bookId = null) => {
    try {
      const { data, error } = await supabase
        .rpc('start_conversation', { 
          other_user_id: otherUserId,
          initial_message: initialMessage,
          book_id: bookId
        });
        
      if (error) throw error;
      
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', data)
        .single();
        
      if (conversationError) throw conversationError;
      
      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== conversationData.id);
        return [conversationData, ...filtered];
      });
      
      setSelectedConversation(conversationData);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto bg-white">
        <ConversationList 
          conversations={conversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={handleSelectConversation}
          loading={loading}
          currentUserId={userId}
        />
      </div>

      <div className="w-2/3 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            <ChatHeader 
              conversation={selectedConversation} 
              currentUserId={userId} 
            />
            <MessageList 
              messages={messages} 
              currentUserId={userId} 
              loading={messageLoading}
              hasMore={hasMoreMessages}
              onLoadOlder={handleLoadOlderMessages}
            />
            <MessageInput 
              onSendMessage={handleSendMessage} 
              conversationId={selectedConversation?.id}
            />
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            {loading ? (
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            ) : conversations.length > 0 ? (
              <span className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                Select a conversation to start chatting.
              </span>
            ) : (
               <span className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                No conversations yet. Start one by messaging a book owner!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer; 