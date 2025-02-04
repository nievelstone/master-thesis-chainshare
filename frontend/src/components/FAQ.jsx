import React from 'react';
import { 
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper 
} from '@mui/material';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const faqSections = [
    {
        title: "Getting Started",
        questions: [
          {
            q: "What is ChainShare?",
            a: "ChainShare is a blockchain-powered platform that allows users to securely share knowledge through documents while earning rewards. Users can upload documents, interact with AI to access information, and earn tokens through content sharing."
          },
          {
            q: "How do I create an account?",
            a: "To use ChainShare, you need a MetaMask wallet connected to the Hedera Testnet. Simply click 'Connect with MetaMask' on the login page, sign the authentication message, and you'll be ready to start."
          },
          {
            q: "What is MetaMask and how do I set it up?",
            a: "MetaMask is a cryptocurrency wallet that allows you to interact with blockchain applications. To set it up: 1) Install the MetaMask browser extension 2) Create a wallet 3) Add the Hedera Testnet network to MetaMask 4) Get some test HBAR from the Hedera Portal."
          }
        ]
      },
      {
        title: "Understanding Document Chunks",
        questions: [
          {
            q: "What are document chunks?",
            a: "Chunks are small, meaningful sections of a document (about 500 characters each). When you upload a document, it's automatically divided into these chunks to make the content more manageable and searchable. Think of chunks like paragraphs or sections of your document."
          },
          {
            q: "Why does ChainShare use chunks?",
            a: "Chunks serve several important purposes:\n• More precise search results - AI can find exactly relevant content\n• Granular access control - Users only pay for the content they need\n• Fair compensation - Document owners earn based on how useful each chunk is\n• Efficient processing - Helps AI understand and reference specific parts of documents"
          },
          {
            q: "How do I see chunks in action?",
            a: "When using the AI chat, you'll see referenced chunks in the responses. Each chunk shows:\n• A relevance rating (high/medium/low)\n• A preview of the content\n• Options to rate the chunk's usefulness\n• The option to buy the full document"
          },
          {
            q: "How are chunks priced?",
            a: "Individual chunks cost 1-5 tokens when accessed through AI chat, based on their relevance and size. When purchasing a full document, each chunk costs 2 tokens. Document owners earn tokens whenever their chunks are accessed."
          }
        ]
      },
    {
      title: "Tokens & Pricing",
      questions: [
        {
          q: "What are tokens and how do they work?",
          a: "Tokens are the platform's currency, used for all transactions. Each token is worth €0.01 and can be purchased using HBAR (Hedera's cryptocurrency). Tokens are required to use the AI chat feature and access document content."
        },
        {
          q: "How much do different actions cost?",
          a: "• AI Chat: 3 tokens per question\n• Document Chunks: 1-5 tokens per chunk\n• Full Documents: 2 tokens per chunk\n• Average document has about 6 chunks per page"
        },
        {
          q: "How do I buy tokens?",
          a: "Navigate to the Tokens page, click 'Buy', enter the amount of tokens you want to purchase, and confirm the transaction through MetaMask. The equivalent HBAR amount will be calculated automatically."
        },
        {
          q: "How do I withdraw my earnings?",
          a: "Go to the Tokens page, click 'Withdraw', enter the amount you want to withdraw and your Hedera wallet address. The tokens will be converted to HBAR and sent to your specified address."
        }
      ]
    },
    {
      title: "Document Management",
      questions: [
        {
          q: "How do I upload a document?",
          a: "1) Click 'Upload' in the navigation menu\n2) Drag and drop your PDF or click to browse\n3) Enter a title and optional advanced settings\n4) Wait for processing to complete\nYour document will be automatically chunked, encrypted, and added to the knowledge base."
        },
        {
          q: "What happens to my document when I upload it?",
          a: "Your document is split into chunks, each chunk is encrypted and embedded with AI-friendly vectors. The content remains encrypted until purchased, ensuring security while allowing the AI to reference relevant sections."
        },
        {
          q: "How do I earn from my uploaded documents?",
          a: "You earn tokens when other users:\n• Access individual chunks through AI chat (1-5 tokens per chunk)\n• Purchase full document access (2 tokens per chunk)\nEarnings are automatically added to your token balance."
        },
        {
          q: "How do I manage my documents?",
          a: "The Documents page shows all your uploaded documents and purchases. You can:\n• View document statistics\n• Track reveal percentage\n• Monitor total rewards\n• Delete documents you've uploaded\n• Access purchased documents"
        }
      ]
    },
    {
      title: "AI Chat",
      questions: [
        {
          q: "How does the AI chat work?",
          a: "The AI analyzes your question, searches through all accessible document chunks, and provides answers based on relevant content. Each response includes references to source documents with relevance ratings."
        },
        {
          q: "What happens when I ask a question?",
          a: "1) Your question costs 3 tokens\n2) The AI searches the knowledge base\n3) Relevant chunks are decrypted\n4) You receive an answer with source references\n5) Document owners earn tokens from accessed chunks"
        },
        {
          q: "How do I rate content quality?",
          a: "Use the thumbs up/down buttons on referenced chunks to rate their quality. This helps improve search results and rewards high-quality content appropriately."
        },
        {
          q: "Why do I need 5 tokens to start chatting?",
          a: "The 5-token minimum ensures you can complete at least one full interaction with the AI (3 tokens) and access some referenced content (1-2 tokens). This helps maintain a smooth user experience."
        }
      ]
    },
    {
      title: "Security & Privacy",
      questions: [
        {
          q: "How is my content protected?",
          a: "All documents are encrypted using AES-256 encryption. Chunk keys are managed through smart contracts, and content is only decrypted when legitimately purchased or accessed."
        },
        {
          q: "Who can access my uploaded documents?",
          a: "Only users who purchase access or receive AI-mediated access through tokens can decrypt your document chunks. You maintain full control over your content while earning from its use."
        },
        {
          q: "What blockchain technology is used?",
          a: "ChainShare uses the Hedera network for its speed, security, and low transaction costs. Smart contracts manage content access and token transactions."
        }
      ]
    }
  ];

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 4, py: 8 }}>
      <Typography 
        variant="h3" 
        component="h2" 
        align="center" 
        gutterBottom
        sx={{
          fontWeight: 700,
          background: 'linear-gradient(90deg, #ff8a00, #e52e71)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 6
        }}
      >
        Frequently Asked Questions
      </Typography>

      {faqSections.map((section, sectionIndex) => (
        <Box key={sectionIndex} sx={{ mb: 6 }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              color: 'primary.main',
              mb: 3
            }}
          >
            {section.title}
          </Typography>

          <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            {section.questions.map((faq, index) => (
              <Accordion 
                key={index} 
                disableGutters 
                elevation={0}
                sx={{
                  '&:not(:last-child)': {
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  },
                  '&:before': {
                    display: 'none'
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ChevronDown />}
                  sx={{
                    px: 3,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.02)'
                    }
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  >
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, py: 2, bgcolor: 'rgba(0,0,0,0.01)' }}>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ whiteSpace: 'pre-line' }}
                  >
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default FAQ;