import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MessageSquare, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api"; // Import the API utility
import { Button } from "../ui/button";

export function ClientMessages() {
  const { token, user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token || !user) {
        setError("User not authenticated.");
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
        setError(err.message || "Failed to fetch messages.");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token, user]);

  if (loading) return <div className="text-center p-8">جاري تحميل الرسائل...</div>;
  if (error) return <div className="text-center p-8 text-red-500">خطأ: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <MessageSquare className="h-7 w-7" />
          <span>الرسائل</span>
        </h1>
        <p className="text-muted-foreground">تواصل مع العمال</p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              لا توجد رسائل بعد. ابدأ محادثة بطلب خدمة!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {conversations.map((conv) => (
            <Card key={conv.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    محادثة مع: {conv.other_participant_name || "مستخدم غير معروف"}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {conv.last_message ? conv.last_message.content : "لا توجد رسائل سابقة"}
                  </p>
                  {conv.last_message && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.last_message.timestamp).toLocaleString("ar-EG")}
                    </p>
                  )}
                </div>
                <Button variant="ghost" asChild>
                  <Link to={`/client-dashboard/messages/${conv.id}`}> {/* Link to individual chat */}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
