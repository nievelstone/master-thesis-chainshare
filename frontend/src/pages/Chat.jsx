import React, { useEffect, useState, useRef } from 'react';
import { Box, Drawer, IconButton, Dialog, useTheme, useMediaQuery } from '@mui/material';
import { MenuRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { chatService } from '../services/api/chatService';
import { getPublicKey } from "../functions/helpers";
import { embedPrompt } from './documentProcessingFunctions';
import { v4 as uuidv4 } from 'uuid';

import ChatSidebar from '../components/chat/ChatSidebar';
import ChatMessages from '../components/chat/ChatMessages';
import ChatInput from '../components/chat/ChatInput';
import TokenRequirementAlert from '../components/token/TokenRequirementAlert';
import PurchaseDialog from '../components/chat/PurchaseDialog';
import { fetchUserTokenHolding } from '../functions/helpers';
import { API_URL } from '../config';

const Chat = () => {
  const [showTokenAlert, setShowTokenAlert] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [tooltipContent, setTooltipContent] = useState({});
  const [loadingTooltip, setLoadingTooltip] = useState({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [documentPrice, setDocumentPrice] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const navigate = useNavigate();


  const toggleMessageDocuments = (messageId) => {
    setExpandedMessages(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };


  const drawerWidth = 300;

  useEffect(() => {
    let timer;
    if (isWaitingForResponse) {
      timer = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % 3);
      }, 2000); // Change step every 2 seconds
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [isWaitingForResponse]);

  useEffect(() => {
    const fetchData = async () => {
      return await fetchUserTokenHolding();
    }
    fetchData().then((amount) => {
      if (amount < 5) {
        setShowTokenAlert(true);
      }
    });
  }, []);

  // Load conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id) {  // Only fetch messages if we have a real conversation ID
      fetchMessages(currentConversation.id);
    }
  }, [currentConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleBuyDocument = async (docId) => {
    //Send the user to the documents page
    navigate('/documents?tab=purchases');
    /*
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get document price
      const priceResponse = await fetch(`${API_URL}/api/get_document_price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authKey: token,
          documentId: docId
        })
      });

      if (!priceResponse.ok) {
        throw new Error('Failed to get document price');
      }

      const { price } = await priceResponse.json();
      setDocumentPrice(price);
      setOpenConfirmDialog(true);
      setPurchaseError(null);
      setSelectedDocumentId(docId);
    } catch (error) {
      console.error('Error getting document price:', error);
      setPurchaseError(error.message);
    }
      */
  };

  const handleRateChunk = async (chunkId, rating) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/rate-chunk-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chunkId,
          rating: rating === 'up' ? 1 : rating === 'down' ? -1 : 0,
          authKey: token
        })
      });

      if (!response.ok) {
        throw new Error('Failed to rate chunk');
      }

      // Update the messages state to reflect the new rating
      setMessages(prevMessages =>
        prevMessages.map(message => ({
          ...message,
          purchases: message.purchases?.map(purchase =>
            purchase.chunk_id === chunkId
              ? { ...purchase, rating: rating === 'up' ? 1 : rating === 'down' ? -1 : null }
              : purchase
          )
        }))
      );

    } catch (error) {
      console.error('Error rating chunk:', error);
      // You might want to show an error message to the user
    }
  };


  const handleCloseDialog = () => {
    setOpenConfirmDialog(false);
    setPurchaseError(null);
  };

  const handleConfirmPurchase = async (docId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/buy_document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authKey: token,
          documentId: docId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to purchase document');
      }

      // Close dialog and refresh data
      setOpenConfirmDialog(false);
      // You may want to add a callback here to refresh the purchases list
      window.location.reload();
    } catch (error) {
      console.error('Error purchasing document:', error);
      setPurchaseError(error.message);
    }
  };

  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation(); // Prevent triggering conversation selection

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Remove conversation from state
      setConversations(prevConversations =>
        prevConversations.filter(conv => conv.id !== conversationId)
      );

      // If the deleted conversation was current, select another one or create new
      if (currentConversation?.id === conversationId) {
        if (conversations.length > 1) {
          const newCurrentConv = conversations.find(conv => conv.id !== conversationId);
          setCurrentConversation(newCurrentConv);
        } else {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      // You might want to show an error message to the user
    }
  };

  const handleChunkClick = async (chunk, event) => {
    if (event.target.closest('.rating-buttons')) {
      return;
    }
    
    if (selectedChunk?.chunk_id === chunk.chunk_id) {
      setSelectedChunk(null);
    } else {
      setSelectedChunk(chunk);
      if (!chunkContent[chunk.chunk_id]) {
        await loadChunkContent(chunk.chunk_id);
      }
    }
  };

  const loadChunkContent = async (chunkId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/api/get_chunk?authKey=${token}&chunkId=${chunkId}`);
      if (!response.ok) {
        throw new Error('Failed to load chunk content');
      }

      const data = await response.json();
      console.log("Chunk content:", data.content);
      return data.content;
    } catch (error) {
      console.error('Error loading chunk content:', error);
    }
  };

  const handleTooltipOpen = async (chunkId) => {
    if (!tooltipContent[chunkId]) {
      setLoadingTooltip(prev => ({ ...prev, [chunkId]: true }));
      try {
        const content = await loadChunkContent(chunkId);
        setTooltipContent(prev => ({ ...prev, [chunkId]: content }));
      } catch (error) {
        console.error('Error loading tooltip content:', error);
        setTooltipContent(prev => ({ ...prev, [chunkId]: 'Error loading content' }));
      }
      setLoadingTooltip(prev => ({ ...prev, [chunkId]: false }));
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      const conversationsArray = Array.isArray(data) ? data : [];
      setConversations(conversationsArray);

      if (!currentConversation && conversationsArray.length > 0) {
        setCurrentConversation(conversationsArray[0]);
      } else if (conversationsArray.length === 0) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError(error.message);
      setConversations([]);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const data = await chatService.getMessages(conversationId);
      const messagesArray = Array.isArray(data) ? data : [];
      setMessages(messagesArray);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    // Just set current conversation to null and show the dummy message
    setCurrentConversation({ id: null, name: 'New Chat' });
    setMessages([{
      conversation_id: null,
      sender_pk: 'AI',
      body: "Hello! I'm your AI assistant. Feel free to ask me anything to access my knowledge.",
      created_at: new Date().toISOString()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
  
    setIsWaitingForResponse(true);
    setLoading(true);
  
    try {
      let conversationId = currentConversation?.id;
      let newConversation = null;
  
      // Create new conversation if needed
      if (!conversationId) {
        const conversationName = `Chat ${new Date().toLocaleString()}`;
        const newId = uuidv4();
        
        try {
          newConversation = await chatService.createConversation(
            conversationName,
            newId
          );
          conversationId = newConversation.id;
          
          // Update the current conversation
          setCurrentConversation(newConversation);
        } catch (error) {
          console.error('Error creating conversation:', error);
          throw error;
        }
      }
  
      // Send user message
      const userMessage = {
        conversation_id: conversationId,
        sender_pk: await getPublicKey(),
        body: inputMessage,
        created_at: new Date().toISOString()
      };
  
      await chatService.sendMessage(userMessage);
  
      // Update UI with user message
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
  
      // Create temporary message for streaming
      const tempAiMessage = {
        conversation_id: conversationId,
        sender_pk: 'AI',
        body: '',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempAiMessage]);
  
      const embeddedPrompt = await embedPrompt(inputMessage);
      let accumulatedResponse = '';
  
      // Stream the response
      await chatService.streamChatResponse(
        conversationId,
        inputMessage,
        embeddedPrompt,
        (parsed) => {
          if (parsed.error === "Insufficient funds") {
            setShowTokenAlert(true);
            return;
          }
  
          if (parsed.delta) {
            accumulatedResponse += parsed.delta;
            setIsWaitingForResponse(false);
            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              newMessages[newMessages.length - 1] = {
                ...lastMessage,
                body: accumulatedResponse
              };
              return newMessages;
            });
          }
        }
      );
  
      // Once streaming is complete, fetch all messages to get references
      const messages = await chatService.getMessages(conversationId);
      setMessages(messages);
  
      // Refresh conversations list
      const updatedConversations = await chatService.getConversations();
      setConversations(updatedConversations);
      
      // If this was a new conversation, make sure we're still focused on it
      if (newConversation) {
        const updatedConversation = updatedConversations.find(
          conv => conv.id === conversationId
        );
        if (updatedConversation) {
          setCurrentConversation(updatedConversation);
        }
      }
  
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
      setIsWaitingForResponse(false);
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{
        display: 'flex',
        flexGrow: 1,
        height: '100%',
        overflow: 'hidden'
      }}>
        {/* Sidebar */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
              bgcolor: 'background.default',
              position: 'relative',
              boxShadow: '0 0 20px rgba(0,0,0,0.05)',
              height: '100%'
            },
          }}
        >
          <ChatSidebar
            conversations={conversations}
            currentConversation={currentConversation}
            onNewChat={handleNewChat}
            onSelectConversation={setCurrentConversation}
            onDeleteConversation={handleDeleteConversation}
          />
        </Drawer>

        {/* Main Chat Area */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minWidth: 0,
          bgcolor: 'background.default'
        }}>
          {isMobile && !drawerOpen && (
            <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ 
              position: 'absolute', 
              top: 60, 
              left: 3,  // Space for main menu + padding
              zIndex: 1 
            }}
          >
            <MenuRounded />
            </IconButton>
          )}

          <ChatMessages
            messages={messages}
            handleChunkClick={handleChunkClick}
            handleRateChunk={handleRateChunk}
            handleBuyDocument={handleBuyDocument}
            expandedMessages={expandedMessages}
            toggleMessageDocuments={toggleMessageDocuments}
            tooltipContent={tooltipContent}
            loadingTooltip={loadingTooltip}
            handleTooltipOpen={handleTooltipOpen}
            isWaitingForResponse={isWaitingForResponse}
            loadingStep={loadingStep}
            messagesEndRef={messagesEndRef}
          />

          <ChatInput
            inputMessage={inputMessage}
            onInputChange={(e) => setInputMessage(e.target.value)}
            onSendMessage={handleSendMessage}
            disabled={showTokenAlert}
            loading={loading}
          />
        </Box>
      </Box>

      {showTokenAlert && <TokenRequirementAlert />}
      
      <PurchaseDialog
        open={openConfirmDialog}
        onClose={handleCloseDialog}
        documentPrice={documentPrice}
        purchaseError={purchaseError}
        onConfirm={() => handleConfirmPurchase(selectedDocumentId)}
      />
    </Box>
  );
};

export default Chat;