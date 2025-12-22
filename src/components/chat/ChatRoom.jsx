import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useMatch, Link } from "react-router-dom";
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
          <div className="mt-3 p-3 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-2 text-sm text-secondary/70 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-secondary/30 shadow-inner">
                <Image className="h-4 w-4 text-secondary" />
              </div>
              <span className="font-semibold text-secondary">صورة مرفقة</span>
            </div>
            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={message.file_url}
                alt={message.file_name || "صورة مرفقة"}
                className="w-full rounded-xl border border-secondary/20 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              />
            </a>
          </div>
        );
      } else {
        return (
          <div className="mt-3 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-2 text-sm text-secondary/70 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-secondary/30 shadow-inner">
                <FileText className="h-4 w-4 text-secondary" />
              </div>
              <span className="font-semibold text-secondary">ملف مرفق</span>
            </div>
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-secondary hover:text-primary font-semibold text-base truncate transition-colors duration-300"
              title={message.file_name}
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-secondary" />
                <span className="font-semibold">{message.file_name || "ملف مرفق"}</span>
              </div>
              <p className="text-sm text-secondary/60 mt-2 font-medium">({formatFileSize(message.file_size)})</p>
            </a>
          </div>
        );
      }
    }

    if (message.content) {
      return (
        <div className="whitespace-pre-wrap leading-relaxed text-base">
          {message.content}
        </div>
      );
    }

    return null;
  };

  if (isLoadingConversation) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-muted to-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
        <p className="text-secondary font-medium text-lg" dir="rtl">جاري تحميل المحادثة...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-destructive/5 to-destructive/10">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-destructive/20 max-w-md mx-4">
        <p className="text-destructive font-medium text-lg" dir="rtl">خطأ: {error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-destructive hover:bg-destructive/90"
        >
          إعادة المحاولة
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {/* Header */}
      <Card className="rounded-none border-0 border-b border-secondary/10 shadow-sm bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard/messages')}
                className="rounded-full hover:bg-secondary/10 transition-colors border border-secondary/20"
              >
                <MessageSquare className="h-5 w-5 text-secondary" />
              </Button>
              <div className="flex items-center space-x-3">
                <Link 
                  to={`/profile/${conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.id || ''}`}
                  className="relative group cursor-pointer"
                >
                  {conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.profile_photo ? (
                    <img
                      src={conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.profile_photo}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-3 border-white shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <User className="h-6 w-6 text-secondary" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-3 border-white rounded-full shadow-sm"></div>
                </Link>
                <Link 
                  to={`/profile/${conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.id || ''}`}
                  className="hover:text-primary transition-colors duration-300"
                >
                  <CardTitle className="text-xl font-bold text-secondary">
                    {conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.full_name || "محادثة"}
                  </CardTitle>
                  <p className="text-sm text-secondary/70 font-medium">
                    {conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.user_type === 'admin' ? 'مشرف' : 
                     conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.user_type === 'technician' ? 'فني' : 
                     conversation?.participants_info?.filter(p => p.id !== user?.user_id)[0]?.user_type || ""}
                  </p>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary/60 font-medium">محادثة خاصة</span>
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
                      ? 'bg-secondary text-white rounded-br-none shadow-xl'
                      : 'bg-white text-secondary rounded-bl-none border border-secondary/20 shadow-lg'
                  } rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
                >
                  {!isCurrentUser && senderInfo && (
                    <Link 
                      to={`/profile/${senderInfo.id}`}
                      className="flex items-center space-x-2 mb-3 hover:text-primary transition-colors duration-300"
                    >
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-secondary/30">
                        <User className="h-3.5 w-3.5 text-secondary" />
                      </div>
                      <span className="font-semibold text-secondary/80 text-sm">{senderInfo.full_name}</span>
                    </Link>
                  )}
                  
                  {renderMessageContent(message)}
                  
                  <div className={`text-xs mt-3 flex items-center justify-end space-x-2 ${
                    isCurrentUser ? 'text-white/80' : 'text-secondary/60'
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {new Date(message.timestamp).toLocaleTimeString("ar-EG", {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {isCurrentUser && (
                      <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    )}
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
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-secondary/20 shadow-lg flex items-center justify-between max-w-md mx-auto hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3">
              {selectedFile?.type?.startsWith('image/') ? (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-secondary/30 shadow-inner">
                  <Image className="h-5 w-5 text-secondary" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-secondary/30 shadow-inner">
                  <FileText className="h-5 w-5 text-secondary" />
                </div>
              )}
              <div>
                <span className="block font-semibold text-secondary truncate max-w-xs">{selectedFile?.name}</span>
                <span className="text-sm text-secondary/60">({formatFileSize(selectedFile?.size)})</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={removeFile}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive/80 p-0 h-auto rounded-full hover:bg-destructive/10 transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <div className="flex-1 space-y-2">
            <div className="relative">
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="اكتب رسالتك هنا..."
                rows={2}
                className="resize-none border-secondary/30 focus:border-primary focus:ring-primary/20 rounded-2xl px-5 py-4 shadow-lg transition-all duration-300 hover:shadow-xl focus:shadow-2xl bg-white text-secondary placeholder-secondary/50"
              />
              <div className="absolute left-3 bottom-3 text-xs text-secondary/40">
                Shift + Enter للانتقال لسطر جديد
              </div>
            </div>
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
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl hover:shadow-xl transition-all duration-300 border-secondary/30 hover:border-secondary/50 bg-white hover:bg-gradient-to-br hover:from-primary/5 hover:to-secondary/5 text-secondary hover:text-secondary font-semibold"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={(!messageContent.trim() && !selectedFile) || loading || isSending}
              className="p-4 bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-2xl shadow-2xl hover:shadow-[0_20px_40px_rgba(244,196,48,0.4)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-base"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-3 border-white/60 border-t-white rounded-full animate-spin" />
                  <span className="text-sm font-medium">جاري الإرسال...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span className="font-semibold">إرسال</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
