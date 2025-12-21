import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star, MapPin, Wrench, Clock, User, MessageCircle, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const TechnicianRecommendations = ({ recommendations, onHire, showDirectHire = true }) => {
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

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="bg-white rounded-t-lg border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
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
      
      <CardContent className="p-6 space-y-4">
        {recommendations.map((tech, index) => (
          <div key={tech.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              {/* Technician Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Avatar className="w-12 h-12 border-2 border-gray-200">
                    <AvatarImage src={tech.avatar_url} alt={tech.name} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900">{tech.name}</h3>
                      <Badge className={`text-xs font-medium ${getUrgencyColor(tech.urgency)}`}>
                        {getExperienceText(tech.experience_years)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Wrench className="h-4 w-4" />
                        <span>{tech.specialization}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{tech.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{tech.experience_years} سنوات خبرة</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-900">{tech.rating}</span>
                    <span className="text-gray-500">({tech.reviews_count || 0} تقييم)</span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MessageCircle className="h-4 w-4" />
                    <span>{tech.jobs_completed || 0} مهمة منجزة</span>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                      لماذا نوصي به؟
                    </Badge>
                    <span className="text-xs text-gray-500">AI Recommendation</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {tech.reasoning || 'هذا الفني لديه خبرة واسعة في هذا النوع من الأعمال ويتمتع بتصنيف عالي من العملاء السابقين.'}
                  </p>
                </div>

                {/* Similarity Score */}
                <div className="flex items-center space-x-2 mt-3">
                  <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                    <span className="font-medium">درجة التشابه:</span>
                    <span className="ml-1 font-semibold text-purple-600">
                      {Math.round((tech.similarity_score || 0) * 100)}%
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 ml-4">
                {showDirectHire && (
                  <Button
                    onClick={() => onHire(tech.id)}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    توظيف مباشر
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.open(`/#/offer/${tech.id}`, '_blank')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  عرض السعر
                </Button>
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
