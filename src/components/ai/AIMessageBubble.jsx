import React from 'react';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import MessageFilePreview from './MessageFilePreview';
import MessageTimestamp from './MessageTimestamp';
import { Button } from '../ui/button';
import ProjectDataDisplay from './ProjectDataDisplay';
import TechnicianRecommendations from './TechnicianRecommendations';

const AIMessageBubble = ({ message, onEditProjectData, onPostProject, onDirectHire, onShowOrderForm, onShowOfferForm, selectedTechnicianId, onTechnicianSelect }) => {
  // Parse enhanced response if message has structured data
  const [enhancedResponse, setEnhancedResponse] = React.useState(message.content);
  const [editingProjectData, setEditingProjectData] = React.useState(false);

  React.useEffect(() => {
    if (message.content && typeof message.content === 'string') {
      try {
        // Try to parse JSON from message content
        const jsonMatch = message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.reply && (parsed.project_data || parsed.technician_recommendations)) {
            setEnhancedResponse(parsed);
          }
        }
      } catch (e) {
        // Not JSON, treat as regular text
      }
    }
  }, [message.content]);

  const handleEditProjectData = (field, value) => {
    setEnhancedResponse(prev => ({
      ...prev,
      project_data: {
        ...prev.project_data,
        [field]: value
      }
    }));
    if (onEditProjectData) {
      onEditProjectData(field, value);
    }
  };

  const handlePostProject = () => {
    if (onShowOrderForm && enhancedResponse?.project_data) {
      onShowOrderForm(enhancedResponse.project_data);
    } else if (onPostProject) {
      onPostProject();
    }
  };

  const handleDirectHire = (technicianId) => {
    onTechnicianSelect(technicianId);
    if (onShowOfferForm && enhancedResponse?.project_data) {
      onShowOfferForm(enhancedResponse.project_data, technicianId);
    } else if (onDirectHire) {
      onDirectHire(technicianId);
    }
  };

  const displayContent = enhancedResponse ? enhancedResponse.reply : message.content || '';

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
        <Bot className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 max-w-xs md:max-w-sm lg:max-w-md">
        <div className="bg-white rounded-2xl rounded-tl-sm shadow-lg border border-gray-200 p-4">
          {/* Main AI Response */}
          <div className="text-gray-800 leading-relaxed mb-4">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 text-right" dir="rtl">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-semibold mt-3 mb-2 text-gray-900 text-right" dir="rtl">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-medium mt-3 mb-2 text-gray-900 text-right" dir="rtl">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2 text-gray-800 text-right" dir="rtl">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900" dir="rtl">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-700 text-right" dir="rtl">
                    {children}
                  </em>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800 text-right" dir="rtl">
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto my-2 text-right" dir="rtl">
                      <code className="text-sm font-mono text-gray-800">{children}</code>
                    </pre>
                  );
                },
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2 text-gray-800 text-right" dir="rtl">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2 text-gray-800 text-right" dir="rtl">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1 text-right" dir="rtl">
                    {children}
                  </li>
                ),
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-right"
                    dir="rtl"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic text-gray-600 text-right" dir="rtl">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {displayContent}
            </ReactMarkdown>
          </div>

          {/* Enhanced Components - Rendered inside the bubble */}
          {enhancedResponse && (
            <div className="space-y-4">
              {/* Project Data Display */}
              {enhancedResponse.project_data && (
                <div className="border-t border-gray-200 pt-4">
                  <ProjectDataDisplay
                    projectData={enhancedResponse.project_data}
                    onEdit={handleEditProjectData}
                    onPostProject={handlePostProject}
                    canEdit={enhancedResponse.can_edit}
                    isEditing={editingProjectData}
                    onToggleEdit={() => setEditingProjectData(!editingProjectData)}
                  />
                </div>
              )}

              {/* Technician Recommendations */}
              {enhancedResponse.technician_recommendations && enhancedResponse.technician_recommendations.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <TechnicianRecommendations
                    recommendations={enhancedResponse.technician_recommendations}
                    onHire={handleDirectHire}
                    showDirectHire={enhancedResponse.show_direct_hire}
                  />
                </div>
              )}

            </div>
          )}

          {/* File previews if any */}
          {(message.image_url || message.file_url) && (
            <div className="mt-3 space-y-2">
              {message.image_url && (
                <MessageFilePreview 
                  key="image" 
                  file={{
                    name: 'صورة',
                    type: 'image/jpeg',
                    url: message.image_url.replace('image/upload/https://', 'https://'),
                    size: 0
                  }} 
                />
              )}
              {message.file_url && (
                <MessageFilePreview 
                  key="file" 
                  file={{
                    name: 'ملف',
                    type: 'application/octet-stream',
                    url: message.file_url,
                    size: 0
                  }} 
                />
              )}
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500 text-left">
          <MessageTimestamp timestamp={message.timestamp} />
        </div>
      </div>
    </div>
  );
};

export default AIMessageBubble;
