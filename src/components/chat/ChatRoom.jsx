import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useMatch } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { MessageSquare, Send, Paperclip, X, Image, FileText, User, Clock, Phone, Video, MoreVertical } from "lucide-react";
import api from "../../utils/api";

export function ChatRoom() {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [conversation, setConversation] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [resolvedConversationId, setResolvedConversationId] = useState(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const isUserBasedRoute = useMatch("/dashboard/messages/:userId");
  const userId = isUserBasedRoute ? conversationId : null;

  // Load conversation and messages
  useEffect(() => {
    if (isUserBasedRoute && userId && token) {
      resolveConversationWithUser();
    } else if (conversationId && !isUserBasedRoute && token) {
      setResolvedConversationId(conversationId);
      setIsLoadingConversation(false);
    }
  }, [isUserBasedRoute, userId, conversationId, token]);

  useEffect(() => {
    if (resolvedConversationId && !isLoadingConversation) {
      fetchConversation();
    }
  }, [resolvedConversationId, isLoadingConversation, token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resolveConversationWithUser = async () => {
    if (!userId || !token) return;

    try {
      setIsLoadingConversation(true);
      setError(null);

      const response = await api.get(`/chat/conversations/get-with-user/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResolvedConversationId(response.id);
    } catch (err) {
      // If no conversation with messages exists (404), don't set an error
      // The conversation will be created when the first message is sent
      const errorMessage = err.message || "";
      if (errorMessage.includes("404") || errorMessage.includes("No conversation with messages found")) {
        console.log("No existing conversation with messages found, will create when first message is sent");
      } else {
        setError(err.message || "فشل في إنشاء المحادثة.");
      }
      console.error("Error resolving conversation with user:", err);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const fetchConversation = async () => {
    if (!token || !resolvedConversationId) return;

    try {
      setLoading(true);
      setError(null);

      // Get conversation details
      const convResponse = await api.get(`/chat/conversations/${resolvedConversationId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setConversation(convResponse);

      // Get initial messages
      const messagesResponse = await api.get(`/chat/conversations/${resolvedConversationId}/messages/?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend returns messages in descending order (newest first), so we reverse to show oldest first
      const reversedMessages = [...(messagesResponse.messages || [])].reverse();
      setMessages(reversedMessages);
      setHasMore(messagesResponse.pagination?.has_next || false);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "فشل في جلب المحادثة.");
      console.error("Error fetching conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreMessages = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = currentPage + 1;
      const response = await api.get(`/chat/conversations/${resolvedConversationId}/messages/?page=${nextPage}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Backend returns messages in descending order (newest first)
      // We need to reverse them to maintain chronological order (oldest first)
      const reversedResponseMessages = [...(response.messages || [])].reverse();
      setMessages(prev => [...reversedResponseMessages, ...prev]);
      setHasMore(response.pagination?.has_next || false);
      setCurrentPage(nextPage);
    } catch (err) {
      console.error("Error fetching more messages:", err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if ((!messageContent.trim() && !selectedFile) || loading || isSending) return;

    try {
      setIsSending(true);
      
      const formData = new FormData();
      
      // If we have a resolved conversation ID, use it
      if (resolvedConversationId) {
        formData.append('conversation', resolvedConversationId);
      } else {
        // If no conversation exists, we need to create one first
        // First, create a conversation with the target user
        const targetUser = userId; // userId is the target user ID from the URL
        const createConvResponse = await api.post('/chat/conversations/', {
          participants: [user?.user_id, parseInt(targetUser)]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        formData.append('conversation', createConvResponse.id);
        setResolvedConversationId(createConvResponse.id);
      }
      
      formData.append('content', messageContent);
      
      if (selectedFile) {
        formData.append('file_url', selectedFile);
        formData.append('file_type', selectedFile.type.split('/')[0]); // image, document, etc.
        formData.append('file_name', selectedFile.name);
      }

      const response = await api.post('/chat/messages/', formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });

      // Create the new message object to add to the current messages
      const newMessage = {
        id: response.id || Date.now(), // Use response ID if available, otherwise use timestamp as fallback
        conversation: resolvedConversationId || response.conversation,
        sender: user?.user_id,
        sender_name: user?.full_name || '',
        sender_avatar: user?.profile_photo || null,
        content: messageContent,
        file_url: response.file_url || null, // Get file URL from response if file was uploaded
        file_type: response.file_type || null,
        file_name: response.file_name || null,
        timestamp: new Date().toISOString(),
        is_read: false,
        reply_to: null
      };

      // Append the new message to the existing messages array
      setMessages(prev => [...prev, newMessage]);

      // Clear form
      setMessageContent("");
      setSelectedFile(null);
      setFilePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Scroll to bottom to show the new message
      setTimeout(() => scrollToBottom(), 10);
    } catch (err) {
      setError(err.message || "فشل في إرسال الرسالة.");
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessageContent = (message) => {
    if (message.file_url) {
      if (message.file_type === 'image') {
        return (
          <div className="mt-2 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <Image className="h-4 w-4" />
              <span className="font-medium">صورة</span>
            </div>
            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={message.file_url}
                alt={message.file_name || "صورة مرفقة"}
                className="max-h-64 rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer"
              />
            </a>
          </div>
        );
      } else {
        return (
          <div className="mt-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">ملف</span>
            </div>
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-600 hover:text-blue-800 font-medium text-sm truncate"
              title={message.file_name}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{message.file_name || "ملف مرفق"}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{formatFileSize(message.file_size)}</p>
            </a>
          </div>
        );
      }
    }

    if (message.content) {
      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
      );
    }

    return null;
  };

  if (isLoadingConversation) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium" dir="rtl">جاري تحميل المحادثة...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md mx-4">
        <p className="text-red-600 font-medium text-lg" dir="rtl">خطأ: {error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-red-500 hover:bg-red-600"
        >
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {/* Header */}
      <Card className="rounded-none border-0 border-b border-gray-200 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard/messages')}
                className="rounded-full hover:bg-gray-100 transition-colors"
              >
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.profile_photo ? (
                    <img
                      src={conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.profile_photo}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.full_name || "محادثة"}
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    {conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.user_type === 'admin' ? 'مشرف' : 
                     conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.user_type === 'technician' ? 'فني' : 
                     conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.user_type || ""}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="rounded-full hover:bg-gray-100">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/50 to-transparent"
        onScroll={(e) => {
          if (e.target.scrollTop === 0 && hasMore) {
            fetchMoreMessages();
          }
        }}
      >
        {hasMore && (
          <div className="text-center py-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMoreMessages} 
              disabled={loading}
              className="rounded-full px-6 hover:shadow-md transition-shadow"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>جاري التحميل...</span>
                </div>
              ) : (
                "تحميل المزيد..."
              )}
            </Button>
          </div>
        )}

        {messages.map((message, index) => {
          const isCurrentUser = message.sender === user?.user_id;
          const senderInfo = conversation?.participants_info?.find(p => p.id === message.sender);
          const showTimeSeparator = index > 0 && 
            new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

          return (
            <React.Fragment key={message.id}>
              {showTimeSeparator && (
                <div className="text-center my-4">
                  <span className="inline-block px-4 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                    {new Date(message.timestamp).toLocaleDateString("ar-EG", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              
              <div
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-none shadow-lg'
                      : 'bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm'
                  } rounded-2xl p-4 transition-all duration-200 hover:shadow-md`}
                >
                  {!isCurrentUser && senderInfo && (
                    <div className="flex items-center space-x-2 mb-2 text-xs text-gray-500">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="font-medium">{senderInfo.full_name}</span>
                    </div>
                  )}
                  
                  {renderMessageContent(message)}
                  
                  <div className={`text-xs mt-2 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} flex items-center justify-end space-x-1`}>
                    <Clock className="h-3 w-3" />
                    <span>{new Date(message.timestamp).toLocaleTimeString("ar-EG", {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-0 border-t border-gray-200 shadow-sm m-0 p-4 bg-white/80 backdrop-blur-sm">
        {/* File Preview */}
        {filePreview && (
          <div className="mb-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {selectedFile?.type?.startsWith('image/') ? (
                <Image className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="truncate font-medium">{selectedFile?.name}</span>
              <span className="text-xs text-gray-500">({formatFileSize(selectedFile?.size)})</span>
            </div>
            <Button
              type="button"
              onClick={removeFile}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 p-0 h-auto rounded-full hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <div className="flex-1 space-y-2">
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك هنا..."
              rows={2}
              className="resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl px-4 py-3 shadow-sm transition-all duration-200"
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx,.txt"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-full hover:shadow-md transition-shadow border-gray-300 hover:border-gray-400"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={(!messageContent.trim() && !selectedFile) || loading || isSending}
              className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">جاري الإرسال...</span>
                </div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
