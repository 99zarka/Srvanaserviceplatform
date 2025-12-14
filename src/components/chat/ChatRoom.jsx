import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useMatch } from "react-router-dom";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { MessageSquare, Send, Paperclip, X, Image, FileText, User, Clock } from "lucide-react";
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
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-20 max-w-xs md:max-w-md">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <Image className="h-4 w-4" />
              <span>صورة</span>
            </div>
            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={message.file_url}
                alt={message.file_name || "صورة مرفقة"}
                className="max-h-48 rounded border hover:opacity-90 transition-opacity"
              />
            </a>
          </div>
        );
      } else {
        return (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-20 max-w-xs md:max-w-md">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <FileText className="h-4 w-4" />
              <span>ملف</span>
            </div>
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-60 hover:text-blue-800 underline text-sm truncate"
              title={message.file_name}
            >
              {message.file_name || "ملف مرفق"}
            </a>
          </div>
        );
      }
    }

    if (message.content) {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }

    return null;
  };

  if (isLoadingConversation) return <div className="text-center p-8" dir="rtl">جاري تحميل المحادثة...</div>;
  if (error) return <div className="text-center p-8 text-red-50" dir="rtl">خطأ: {error}</div>;

 return (
    <div className="flex flex-col h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <Card className="rounded-none border-0 border-b shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/messages')}>
                <MessageSquare className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-lg">
                  {conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.full_name || "محادثة"}
                </CardTitle>
                <p className="text-xs text-gray-500 text-right">
                  {conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.user_type || ""}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" onScroll={(e) => {
        if (e.target.scrollTop === 0 && hasMore) {
          fetchMoreMessages();
        }
      }}>
        {hasMore && (
          <div className="text-center py-2">
            <Button variant="outline" size="sm" onClick={fetchMoreMessages} disabled={loading}>
              تحميل المزيد...
            </Button>
          </div>
        )}

        {messages.map((message) => {
          const isCurrentUser = message.sender === user?.user_id;
          const senderInfo = conversation?.participants_info?.find(p => p.id === message.sender);

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${
                  isCurrentUser
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                } rounded-lg p-3 shadow-sm`}
              >
                {!isCurrentUser && senderInfo && (
                  <div className="flex items-center space-x-2 mb-1 text-xs text-gray-500">
                    <User className="h-3 w-3" />
                    <span>{senderInfo.full_name}</span>
                  </div>
                )}
                
                {renderMessageContent(message)}
                
                <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} flex items-center justify-end space-x-1`}>
                  <Clock className="h-3 w-3" />
                  <span>{new Date(message.timestamp).toLocaleTimeString("ar-EG", {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <Card className="rounded-none border-0 border-t shadow-sm m-0 p-4 bg-white">
        {/* File Preview */}
        {filePreview && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {selectedFile?.type?.startsWith('image/') ? (
                <Image className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="truncate">{selectedFile?.name}</span>
              <span className="text-xs">({formatFileSize(selectedFile?.size)})</span>
            </div>
            <Button
              type="button"
              onClick={removeFile}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-70 p-0 h-auto"
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
              className="resize-none"
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
              className="p-2"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={(!messageContent.trim() && !selectedFile) || loading || isSending}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white"
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
