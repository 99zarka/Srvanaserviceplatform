import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Star } from "lucide-react";
import api from "../../utils/api"; // Import the API utility

export function WorkerReviews() {
  const { token } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkerReviews = async () => {
      if (!token) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Fetch reviews from the backend
        const data = await api.get("/reviews/worker-reviews/", {
          headers: { Authorization: `Bearer ${token}` },
        }); // Assuming "/reviews/worker-reviews/" is your backend endpoint
        setReviews(data.results || []); // Assuming results is an array of review objects
        setAverageRating(data.average_rating || 0);
        setTotalReviews(data.count || 0);
      } catch (err) {
        setError(err.message || "Failed to fetch reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerReviews();
  }, [token]);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) return <div className="text-center p-8">جاري تحميل التقييمات...</div>;
  if (error) return <div className="text-center p-8 text-red-500">خطأ: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 flex items-center space-x-2">
          <Star className="h-7 w-7 text-yellow-600" />
          <span>التقييمات والمراجعات</span>
        </h1>
        <p className="text-muted-foreground">شاهد ما يقوله العملاء عن عملك</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="flex justify-center mb-2">
              {renderStars(averageRating)}
            </div>
            <div className="mb-2 text-2xl font-bold">
              {averageRating.toFixed(1)} / 5.0
            </div>
            <p className="text-muted-foreground">
              بناءً على {totalReviews} مراجعة
            </p>
          </div>
        </CardContent>
      </Card>

      {reviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mt-6">جميع المراجعات</h2>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-center mb-2">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString("ar-EG")}
                  </span>
                </div>
                <p className="text-lg font-medium mb-1">
                  {review.client_name || "عميل غير معروف"}
                </p>
                <p className="text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
