import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MessageSquare, ArrowRight, User, Clock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { Button } from "../ui/button";

export function ClientMessages() {
  const { token, user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
    const fetchConversations = async () => {
      if (!token || !user) {
        setError("المستخدم غير مصادق عليه.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch conversations from the backend
        const response = await api.get("/chat/conversations/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Handle paginated response - extract results array
        const data = response.results || response;
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "فشل في جلب الرسائل.");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token, user]);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">جاري تحميل الرسائل...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-pink-50" dir="rtl">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-100 max-w-md mx-4">
        <p className="text-red-600 font-medium text-lg">خطأ: {error}</p>
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
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">الرسائل</h1>
              <p className="text-gray-600">تواصل مع العمال وادار محادثاتك</p>
            </div>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-md mx-auto">
              <div className="p-3 bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد رسائل</h3>
              <p className="text-gray-600 mb-4">
                لا توجد رسائل بعد. ابدأ محادثة بطلب خدمة!
              </p>
              <Button asChild>
                <Link to="/dashboard/services">الذهاب إلى الخدمات</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv) => {
              // Find the other participant (not current user)
              const otherParticipant = conv.participants_info?.find(p => p.id !== user?.user_id);
              const otherUserId = otherParticipant?.id;
              
              return (
                <Card 
                  key={conv.id} 
                  className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white border border-gray-200 rounded-xl overflow-hidden"
                >
                  <CardContent className="pt-6 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          {otherParticipant?.profile_photo ? (
                            <img
                              src={otherParticipant?.profile_photo}
                              alt={otherParticipant?.full_name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                            otherParticipant?.is_online ? 'bg-green-400' : 'bg-gray-300'
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <CardTitle className="text-lg font-semibold text-gray-800 truncate">
                              {otherParticipant?.full_name || "مستخدم غير معروف"}
                            </CardTitle>
                            {otherParticipant?.user_type && (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                otherParticipant.user_type === 'admin' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : otherParticipant.user_type === 'technician'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {otherParticipant.user_type === 'admin' ? 'مشرف' : 
                                 otherParticipant.user_type === 'technician' ? 'فني' : 
                                 otherParticipant.user_type}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <p className="truncate max-w-xs">
                              <span className="font-medium">آخر رسالة:</span>{' '}
                              {conv.last_message?.content || "لا توجد رسائل سابقة"}
                            </p>
                            
                            {conv.last_message?.timestamp && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {new Date(conv.last_message.timestamp).toLocaleTimeString("ar-EG", {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        asChild
                        className="ml-4 p-2 hover:bg-blue-50 transition-colors"
                      >
                        <Link to={`/dashboard/messages/${otherUserId}`}>
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        </Link>
                      </Button>
                    </div>
                    
                    {/* Conversation stats */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{conv.messages?.length || 0} رسالة</span>
                        </span>
                      </div>
                      
                      {conv.last_message?.timestamp && (
                        <span className="text-xs text-gray-400">
                          {new Date(conv.last_message.timestamp).toLocaleDateString("ar-EG")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
