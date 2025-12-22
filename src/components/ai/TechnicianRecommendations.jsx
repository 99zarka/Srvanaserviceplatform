import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star, MapPin, Wrench, Clock, User, MessageCircle, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useIsMobile } from '../ui/use-mobile';

const TechnicianRecommendations = ({ recommendations, onHire, showDirectHire = true }) => {
  const isMobile = useIsMobile();

  if (!recommendations || recommendations.length === 0) return null;

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getExperienceText = (years) => {
    if (years >= 10) return 'خبير';
    if (years >= 5) return 'متوسط الخبرة';
    if (years >= 2) return 'جديد الخبرة';
    return 'مبتدئ';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white" dir="rtl">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between flex-row-reverse">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                فنيين مقترحين
              </CardTitle>
              <p className="text-sm text-gray-600">Recommended Technicians</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm font-medium bg-white border-gray-300">
            {recommendations.length} فني
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {recommendations.map((tech, index) => (
          <div key={tech.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col space-y-4">
              {/* Technician Info */}
              <div className="w-full">
                {/* Header Row */}
                <div className="flex items-center space-x-reverse space-x-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-reverse space-x-2 mb-1">
                      <Badge className={`text-xs font-medium px-2 py-1 ${getUrgencyColor(tech.urgency)}`}>
                        {getExperienceText(tech.experience_years)}
                      </Badge>
                      <Link
                        to={`/profile/${tech.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 truncate hover:underline"
                      >
                        {tech.name}
                      </Link>
                    </div>

                    <div className="flex items-center space-x-reverse space-x-1 mb-2">
                      <span className="text-sm text-gray-500">
                        ({tech.reviews_count || 0} تقييم)
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {tech.rating || 0}
                      </span>
                      {renderStars(Math.floor(tech.rating || 0))}
                    </div>
                  </div>

                  <Avatar className="w-12 h-12 border-2 border-gray-200 flex-shrink-0">
                    <AvatarImage src={tech.avatar_url} alt={tech.name} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Wrench className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{tech.specialization}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="truncate">{tech.location}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    <span>{tech.experience_years} سنوات خبرة</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MessageCircle className="h-4 w-4 text-purple-600 flex-shrink-0" />
                    <span>{tech.jobs_completed || 0} مهمة منجزة</span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                      لماذا نوصي به؟
                    </Badge>
                    <span className="text-xs text-gray-500">AI Recommendation</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {tech.reasoning || 'هذا الفني لديه خبرة واسعة في هذا النوع من الأعمال ويتمتع بتصنيف عالي من العملاء السابقين.'}
                  </p>
                </div>

                {/* Similarity Score */}
                <div className="flex items-center justify-start">
                  <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                    <span className="font-medium">درجة التشابه:</span>
                    <span className="mr-1 font-semibold text-blue-600">
                      {Math.round((tech.similarity_score || 0) * 100)}%
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'flex-row flex-wrap gap-2 justify-center'}`}>
                {showDirectHire && (
                  <Button
                    onClick={() => onHire(tech.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md flex-1 min-w-[140px]"
                  >
                    <Wrench className="h-4 w-4 mr-2 flex-shrink-0" />
                    توظيف مباشر
                  </Button>
                )}

                <Link
                  to={`/offer/${tech.id}`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-10 px-4 py-2 shadow-sm hover:shadow-md flex-1 min-w-[120px]"
                >
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  عرض السعر
                </Link>

                <Link
                  to={`/profile/${tech.id}`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-10 px-4 py-2 shadow-sm hover:shadow-md flex-1 min-w-[120px]"
                >
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  الملف الشخصي
                </Link>

                <Link
                  to={`/dashboard/messages/${tech.id}`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 h-10 px-4 py-2 shadow-sm hover:shadow-md flex-1 min-w-[100px]"
                >
                  <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  الرسائل
                </Link>
              </div>
            </div>

            {/* Divider */}
            {index < recommendations.length - 1 && (
              <div className="border-t border-gray-200 mt-4"></div>
            )}
          </div>
        ))}

        {/* Additional Info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200 mt-4">
          هذه التوصيات مبنية على تحليل الذكاء الاصطناعي لاحتياجاتك ومطابقة المهارات والخبرات
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicianRecommendations;
