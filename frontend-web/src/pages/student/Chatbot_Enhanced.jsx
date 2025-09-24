import {
  MessageCircle,
  Send,
  Bot,
  User as UserIcon,
  Phone,
  Video,
  Paperclip,
  Mic,
  Smile,
  MoreVertical,
  Search,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  BookOpen,
  Calendar,
  CreditCard,
  Award,
  MapPin,
  Bell,
  RefreshCw,
  Zap,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Download,
  Share2,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Hash,
  AtSign,
  FileText,
  Image as ImageIcon,
  File,
  Link as LinkIcon
} from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const StudentChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('chat');
  const [currentConversation, setCurrentConversation] = useState(null);
  const [chatStats, setChatStats] = useState(null);
  const [botCapabilities, setBotCapabilities] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchChatData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatData = async () => {
    try {
      setLoading(true);

      setMessages([
        {
          _id: '1',
          type: 'system',
          content: 'Welcome to the Student Portal Chatbot! How can I assist you today?',
          timestamp: new Date().toISOString(),
          status: 'read'
        },
        {
          _id: '2',
          type: 'bot',
          content: 'Hi! I\'m your virtual assistant. I can help you with academics, fees, library, hostel, placements, and more. What would you like to know?',
          timestamp: new Date(Date.now() - 60000).toISOString(),
          status: 'read',
          quickReplies: [
            { _id: '1', text: 'Check Fees', payload: 'fees_status', icon: 'credit-card' },
            { _id: '2', text: 'Library Books', payload: 'library_books', icon: 'book-open' },
            { _id: '3', text: 'Exam Schedule', payload: 'exam_schedule', icon: 'calendar' },
            { _id: '4', text: 'Hostel Info', payload: 'hostel_info', icon: 'map-pin' }
          ]
        }
      ]);

      setConversations([
        {
          _id: '1',
          title: 'General Support',
          lastMessage: 'How can I help you with your fees?',
          lastActivity: new Date().toISOString(),
          unreadCount: 0,
          status: 'active',
          platform: 'web',
          participantCount: 1
        },
        {
          _id: '2',
          title: 'Academic Queries',
          lastMessage: 'Your exam schedule has been updated',
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 1,
          status: 'priority',
          platform: 'whatsapp',
          participantCount: 1
        },
        {
          _id: '3',
          title: 'Library Support',
          lastMessage: 'Book returned successfully',
          lastActivity: new Date(Date.now() - 7200000).toISOString(),
          unreadCount: 0,
          status: 'active',
          platform: 'telegram',
          participantCount: 1
        }
      ]);

      setChatStats({
        totalChats: 12,
        activeChats: 2,
        avgResponseTime: '< 30 seconds',
        satisfactionScore: 4.8,
        resolvedQueries: 10,
        popularTopics: ['Fees Payment', 'Exam Schedules', 'Library Books', 'Hostel Services', 'Academic Records']
      });

      setBotCapabilities([
        {
          _id: '1',
          category: 'Academic',
          title: 'Grades & Transcripts',
          description: 'Check your grades, download transcripts, and view academic progress',
          icon: 'award',
          examples: ['What are my grades?', 'Download transcript', 'Show my GPA'],
          available: true
        },
        {
          _id: '2',
          category: 'Financial',
          title: 'Fees & Payments',
          description: 'View fee structure, make payments, and get receipts',
          icon: 'credit-card',
          examples: ['Show pending fees', 'Pay hostel fees', 'Download receipt'],
          available: true
        },
        {
          _id: '3',
          category: 'Library',
          title: 'Library Services',
          description: 'Search books, check due dates, and manage reservations',
          icon: 'book-open',
          examples: ['Search for books', 'Check due dates', 'Renew books'],
          available: true
        },
        {
          _id: '4',
          category: 'Campus',
          title: 'Hostel & Facilities',
          description: 'Hostel info, room allocation, and facility requests',
          icon: 'map-pin',
          examples: ['Check room details', 'Request maintenance', 'Hostel timings'],
          available: true
        },
        {
          _id: '5',
          category: 'Career',
          title: 'Placements & Jobs',
          description: 'Job opportunities, application status, and career guidance',
          icon: 'briefcase',
          examples: ['Show job openings', 'Check application status', 'Interview tips'],
          available: true
        },
        {
          _id: '6',
          category: 'General',
          title: 'Campus Information',
          description: 'Events, announcements, and general campus queries',
          icon: 'info',
          examples: ['Today\'s events', 'Campus map', 'Contact information'],
          available: true
        }
      ]);

      setCurrentConversation('1');
    } catch (error) {
      console.error('Error fetching chat data:', error);
      toast.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text, isQuickReply = false) => {
    if (!text.trim()) return;

    const userMessage = {
      _id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      const botResponse = generateBotResponse(text);

      setMessages(prev => prev.map(msg =>
        msg._id === userMessage._id ? { ...msg, status: 'read' } : msg
      ));

      const botMessage = {
        _id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse.content,
        timestamp: new Date().toISOString(),
        status: 'read',
        quickReplies: botResponse.quickReplies,
        metadata: botResponse.metadata
      };

      setMessages(prev => [...prev, botMessage]);

      if (soundEnabled) {
        toast.success('Message received');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg =>
        msg._id === userMessage._id ? { ...msg, status: 'failed' } : msg
      ));
      toast.error('Failed to send message');
    } finally {
      setIsTyping(false);
    }
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('fee') || lowerMessage.includes('payment')) {
      return {
        content: 'I can help you with fee-related queries! Your current semester fee is ₹45,000 and the due date is March 15th. You can pay online through the portal.',
        quickReplies: [
          { _id: '1', text: 'Pay Now', payload: 'pay_fees', icon: 'credit-card' },
          { _id: '2', text: 'View Receipt', payload: 'view_receipt', icon: 'file-text' },
          { _id: '3', text: 'Fee Structure', payload: 'fee_structure', icon: 'info' }
        ],
        metadata: { intent: 'fees_query', confidence: 0.95 }
      };
    }

    if (lowerMessage.includes('grade') || lowerMessage.includes('marks') || lowerMessage.includes('result')) {
      return {
        content: 'Your current semester GPA is 8.5/10. You have 6 subjects with an average of 85%. Would you like to see detailed grades or download your transcript?',
        quickReplies: [
          { _id: '1', text: 'Detailed Grades', payload: 'detailed_grades', icon: 'award' },
          { _id: '2', text: 'Download Transcript', payload: 'download_transcript', icon: 'download' },
          { _id: '3', text: 'Subject Wise', payload: 'subject_wise', icon: 'book-open' }
        ],
        metadata: { intent: 'academic_query', confidence: 0.92 }
      };
    }

    if (lowerMessage.includes('book') || lowerMessage.includes('library')) {
      return {
        content: 'You currently have 3 books issued from the library. 1 book is due tomorrow. Would you like to renew them or search for new books?',
        quickReplies: [
          { _id: '1', text: 'Renew Books', payload: 'renew_books', icon: 'refresh-cw' },
          { _id: '2', text: 'Search Books', payload: 'search_books', icon: 'search' },
          { _id: '3', text: 'My Books', payload: 'my_books', icon: 'book-open' }
        ],
        metadata: { intent: 'library_query', confidence: 0.88 }
      };
    }

    if (lowerMessage.includes('exam') || lowerMessage.includes('schedule') || lowerMessage.includes('timetable')) {
      return {
        content: 'Your next exam is Mathematics on March 20th at 9:00 AM in Hall A. You have 5 more exams scheduled this semester.',
        quickReplies: [
          { _id: '1', text: 'Full Schedule', payload: 'exam_schedule', icon: 'calendar' },
          { _id: '2', text: 'Hall Details', payload: 'hall_details', icon: 'map-pin' },
          { _id: '3', text: 'Set Reminders', payload: 'set_reminders', icon: 'bell' }
        ],
        metadata: { intent: 'exam_query', confidence: 0.91 }
      };
    }

    if (lowerMessage.includes('hostel') || lowerMessage.includes('room')) {
      return {
        content: 'You are allocated to Room 204, Block B. Your roommate is John Doe. The hostel mess timings are 7-9 AM, 12-2 PM, and 7-9 PM.',
        quickReplies: [
          { _id: '1', text: 'Room Details', payload: 'room_details', icon: 'map-pin' },
          { _id: '2', text: 'Mess Menu', payload: 'mess_menu', icon: 'utensils' },
          { _id: '3', text: 'Maintenance Request', payload: 'maintenance', icon: 'settings' }
        ],
        metadata: { intent: 'hostel_query', confidence: 0.87 }
      };
    }

    if (lowerMessage.includes('job') || lowerMessage.includes('placement') || lowerMessage.includes('internship')) {
      return {
        content: 'There are 12 new job openings available! Top companies include TechCorp, DataFlow, and StartupXYZ. Your application to TechCorp is under review.',
        quickReplies: [
          { _id: '1', text: 'View Jobs', payload: 'view_jobs', icon: 'briefcase' },
          { _id: '2', text: 'Application Status', payload: 'app_status', icon: 'clock' },
          { _id: '3', text: 'Interview Tips', payload: 'interview_tips', icon: 'help-circle' }
        ],
        metadata: { intent: 'placement_query', confidence: 0.89 }
      };
    }

    return {
      content: 'I understand you\'re looking for information. I can help you with academics, fees, library, hostel, placements, and general campus queries. What specific information do you need?',
      quickReplies: [
        { _id: '1', text: 'Academic Info', payload: 'academic_help', icon: 'graduation-cap' },
        { _id: '2', text: 'Financial Info', payload: 'financial_help', icon: 'credit-card' },
        { _id: '3', text: 'Campus Services', payload: 'campus_help', icon: 'map-pin' },
        { _id: '4', text: 'Other Queries', payload: 'other_help', icon: 'help-circle' }
      ],
      metadata: { intent: 'general_query', confidence: 0.5 }
    };
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply.text, true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(currentMessage);
    }
  };

  const getMessageIcon = (status) => {
    switch (status) {
      case 'sending': return <Clock className="w-4 h-4 ml-1 inline" />;
      case 'sent': return <CheckCircle2 className="w-4 h-4 ml-1 inline text-gray-400" />;
      case 'delivered': return <CheckCircle2 className="w-4 h-4 ml-1 inline text-blue-400" />;
      case 'read': return <CheckCircle2 className="w-4 h-4 ml-1 inline text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 ml-1 inline text-red-500" />;
      default: return null;
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'whatsapp': return <MessageCircle className="w-4 h-4 text-green-500 inline ml-1" />;
      case 'telegram': return <Send className="w-4 h-4 text-blue-400 inline ml-1" />;
      case 'sms': return <Phone className="w-4 h-4 text-gray-500 inline ml-1" />;
      default: return <Bot className="w-4 h-4 text-purple-500 inline ml-1" />;
    }
  };

  const getCapabilityIcon = (icon) => {
    switch (icon) {
      case 'award': return <Award className="w-5 h-5 mr-2 text-yellow-500" />;
      case 'credit-card': return <CreditCard className="w-5 h-5 mr-2 text-blue-500" />;
      case 'book-open': return <BookOpen className="w-5 h-5 mr-2 text-purple-500" />;
      case 'map-pin': return <MapPin className="w-5 h-5 mr-2 text-green-500" />;
      case 'info': return <Info className="w-5 h-5 mr-2 text-gray-500" />;
      case 'briefcase': return <Award className="w-5 h-5 mr-2 text-pink-500" />;
      default: return <Bot className="w-5 h-5 mr-2 text-purple-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Chat Area */}
      <div className="lg:col-span-2 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="text-2xl font-bold mb-1">AI Chatbot Assistant</div>
          <div className="text-gray-500">Get instant help with academics, fees, library, hostel, and more</div>
        </motion.div>

        {/* Stats Cards */}
        {chatStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 text-center"
            >
              <div className="font-semibold text-gray-600">Total Chats</div>
              <div className="text-xl font-bold">{chatStats.totalChats}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 text-center"
            >
              <div className="font-semibold text-gray-600">Resolved</div>
              <div className="text-xl font-bold">{chatStats.resolvedQueries}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 text-center"
            >
              <div className="font-semibold text-gray-600">Response Time</div>
              <div className="text-xl font-bold">{chatStats.avgResponseTime}</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 text-center"
            >
              <div className="font-semibold text-gray-600">Satisfaction</div>
              <div className="text-xl font-bold">{chatStats.satisfactionScore}/5</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 text-center"
            >
              <div className="font-semibold text-gray-600">Active Now</div>
              <div className="text-xl font-bold">{chatStats.activeChats}</div>
            </motion.div>
          </div>
        )}

        {/* Chat Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-xl shadow-lg border border-gray-100 ${chatExpanded ? 'h-screen' : 'h-[600px]'} flex flex-col`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-purple-500" />
              <span className="font-semibold">AI Assistant</span>
              <span className="ml-2 text-xs text-green-500">● Online</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg hover:bg-gray-100"
                title={soundEnabled ? "Mute" : "Unmute"}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setChatExpanded(!chatExpanded)}
                className="p-2 rounded-lg hover:bg-gray-100"
                title={chatExpanded ? "Minimize" : "Maximize"}
              >
                {chatExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : message.type === 'system'
                    ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {message.content}
                  <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {message.type === 'user' && getMessageIcon(message.status)}
                  </div>
                </div>
              </motion.div>
            ))}
            {/* Quick Replies */}
            {messages.length > 0 && messages[messages.length - 1].quickReplies && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 ml-4"
              >
                {messages[messages.length - 1].quickReplies?.map((reply) => (
                  <button
                    key={reply._id}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-2 text-sm bg-white border border-purple-300 text-purple-600 rounded-full hover:bg-purple-50 transition-colors flex items-center gap-1"
                  >
                    {getCapabilityIcon(reply.icon)}
                    {reply.text}
                  </button>
                ))}
              </motion.div>
            )}
            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 px-4 py-2 rounded-2xl text-gray-500 flex items-center gap-2">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-150">●</span>
                  <span className="animate-bounce delay-300">●</span>
                  <span>AI is typing...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-100 flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg ${voiceEnabled ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
              title={voiceEnabled ? "Disable Voice" : "Enable Voice"}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={() => sendMessage(currentMessage)}
              disabled={!currentMessage.trim()}
              className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col gap-4">
        {/* Bot Capabilities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <div className="font-semibold mb-3">What I Can Help With</div>
          {botCapabilities.slice(0, 4).map((capability, index) => (
            <motion.div
              key={capability._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-2 mb-2"
              onClick={() => sendMessage(capability.examples[0])}
            >
              {getCapabilityIcon(capability.icon)}
              <div>
                <div className="font-medium">{capability.title}</div>
                <div className="text-xs text-gray-500">{capability.category}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Conversations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <div className="font-semibold mb-3">Recent Conversations</div>
          {conversations.slice(0, 3).map((conversation, index) => (
            <motion.div
              key={conversation._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`p-3 rounded-lg cursor-pointer transition-colors flex flex-col mb-2 ${
                currentConversation === conversation._id ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setCurrentConversation(conversation._id)}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{conversation.title}</span>
                {getPlatformIcon(conversation.platform)}
                {conversation.unreadCount > 0 && (
                  <span className="ml-2 bg-purple-200 text-purple-700 text-xs px-2 py-0.5 rounded-full">{conversation.unreadCount}</span>
                )}
              </div>
              <div className="text-xs text-gray-500">{conversation.lastMessage}</div>
              <div className="text-xs text-gray-400">{new Date(conversation.lastActivity).toLocaleDateString()}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Popular Topics */}
        {chatStats && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
          >
            <div className="font-semibold mb-3">Popular Topics</div>
            {chatStats.popularTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => sendMessage(`Tell me about ${topic.toLowerCase()}`)}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mb-1"
              >
                {topic}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentChatbot;