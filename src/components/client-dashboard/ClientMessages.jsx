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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
        <p className="text-secondary font-medium">جاري تحميل الرسائل...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-secondary/20 p-4 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2 sm:p-3 bg-secondary/10 rounded-xl sm:rounded-2xl">
                  <MessageSquare className="h-6 sm:h-8 w-6 sm:w-8 text-secondary" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-secondary">الرسائل</h1>
                  <p className="text-secondary/80 text-sm sm:text-base">تواصل مع العمال وادار محادثاتك</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-20 sm:w-24 h-2 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-secondary/20">
          {conversations.length === 0 ? (
            <div className="py-12 sm:py-16">
              <div className="text-center max-w-sm sm:max-w-md mx-auto px-4">
                <div className="bg-secondary/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <MessageCircle className="h-6 sm:h-10 w-6 sm:w-10 text-secondary" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-secondary mb-2 sm:mb-3">لا توجد رسائل</h3>
                <p className="text-secondary/80 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
                  لا توجد رسائل بعد. ابدأ محادثة بطلب خدمة!
                </p>
                <Button asChild className="bg-secondary hover:bg-secondary/90 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg w-full sm:w-auto">
                  <Link to="/dashboard/services">الذهاب إلى الخدمات</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="space-y-3">
                {conversations.map((conv) => {
                  const otherParticipant = conv.participants_info?.find(p => p.id !== user?.user_id);
                  const otherUserId = otherParticipant?.id;
                  
                  return (
                    <Link 
                      to={`/dashboard/messages/${otherUserId}`} 
                      key={conv.id} 
                      className="block hover:shadow-lg transition-all duration-300 hover:scale-[1.01] bg-white border border-secondary/20 rounded-xl sm:rounded-2xl overflow-hidden group"
                    >
                      <div className="p-4 sm:p-5">
                        <div className="flex items-start justify-between space-x-3 w-full">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <div className="relative group cursor-pointer">
                                <Link to={`/dashboard/profile/${otherUserId}`} onClick={(e) => e.stopPropagation()}>
                                  {otherParticipant?.profile_photo ? (
                                    <img
                                      src={otherParticipant?.profile_photo}
                                      alt={otherParticipant?.full_name}
                                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-secondary/20 transition-all duration-300 group-hover:border-secondary group-hover:scale-105 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary/10 border-2 border-secondary/20 flex items-center justify-center transition-all duration-300 group-hover:border-secondary shadow-sm">
                                      <User className="h-6 w-6 text-secondary" />
                                    </div>
                                  )}
                                </Link>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full transition-all duration-300 ${
                                  otherParticipant?.is_online ? 'bg-green-400' : 'bg-gray-300'
                                } group-hover:scale-110`}></div>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <Link to={`/dashboard/profile/${otherUserId}`} onClick={(e) => e.stopPropagation()}>
                                  <h3 className="text-sm sm:text-base font-bold text-secondary hover:text-secondary/80 transition-colors truncate cursor-pointer group-hover:text-secondary/80">
                                    {otherParticipant?.full_name || "مستخدم غير معروف"}
                                  </h3>
                                </Link>
                                {otherParticipant?.user_type && (
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    otherParticipant.user_type === 'admin' 
                                      ? 'bg-purple-100 text-purple-700' 
                                      : otherParticipant.user_type === 'technician'
                                      ? 'bg-blue-100 text-blue-700'
                                      : otherParticipant.user_type === 'client'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-secondary/10 text-secondary'
                                  }`}>
                                    {otherParticipant.user_type === 'admin' ? 'مشرف' : 
                                     otherParticipant.user_type === 'technician' ? 'فني' :
                                     otherParticipant.user_type === 'client' ? 'عميل' :
                                     otherParticipant.user_type}
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-start space-x-2 text-xs sm:text-sm text-secondary/70">
                                  <MessageCircle className="h-3 sm:h-4 w-3 sm:w-4 text-secondary mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <span className="font-medium">آخر رسالة:</span>
                                    <span className="block truncate">
                                      {conv.last_message?.content || "لا توجد رسائل سابقة"}
                                    </span>
                                  </div>
                                </div>
                                
                                {conv.last_message?.timestamp && (
                                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-secondary/60">
                                    <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-secondary" />
                                    <span>
                                      {new Date(conv.last_message.timestamp).toLocaleTimeString("ar-EG", {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      {new Date(conv.last_message.timestamp).toLocaleDateString("ar-EG")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end justify-between flex-shrink-0">
                            <div className="text-right">
                              <div className="flex items-center space-x-1 text-xs sm:text-sm text-secondary/60">
                                <MessageCircle className="h-3 sm:h-4 w-3 sm:w-4 text-secondary" />
                                <span>{conv.messages?.length || 0} رسالة</span>
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              asChild
                              className="p-2 sm:p-3 hover:bg-secondary/10 transition-all duration-300 hover:scale-105"
                            >
                              <Link to={`/dashboard/messages/${otherUserId}`} onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                  <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5 text-secondary" />
                                  <span className="text-secondary font-medium text-xs sm:text-sm">فتح</span>
                                </div>
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
