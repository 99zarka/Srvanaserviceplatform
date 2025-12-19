import React from 'react';
import { FileText, Image as ImageIcon, Download, X } from 'lucide-react';
import { Button } from '../ui/button';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const MessageFilePreview = ({ file, isUserMessage = false, onRemove }) => {
  const isImage = file.type?.startsWith('image/');
  const bgColor = isUserMessage ? 'bg-blue-500/10' : 'bg-gray-100';
  const textColor = isUserMessage ? 'text-blue-600' : 'text-gray-700';

  return (
    <div className={`rounded-xl p-3 ${bgColor} border ${isUserMessage ? 'border-blue-200' : 'border-gray-200'}`}>
      <div className="flex items-start space-x-3">
        {/* File Icon */}
        <div className={`w-10 h-10 rounded-lg ${isUserMessage ? 'bg-blue-500/20' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0`}>
          {isImage ? (
            <ImageIcon className={`h-6 w-6 ${isUserMessage ? 'text-blue-600' : 'text-gray-600'}`} />
          ) : (
            <FileText className={`h-6 w-6 ${isUserMessage ? 'text-blue-600' : 'text-gray-600'}`} />
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </div>
            <div className="text-xs text-gray-500 whitespace-nowrap">
              {formatFileSize(file.size)}
            </div>
          </div>
          
          {/* Image Preview */}
          {isImage && file.url && (
            <div className="mt-2">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}

          {/* File Actions */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!isImage && (
                <span className={`text-xs px-2 py-1 rounded-full ${isUserMessage ? 'bg-blue-500/20 text-blue-600' : 'bg-gray-200 text-gray-700'}`}>
                  ملف {file.type?.split('/')[1]?.toUpperCase() || 'غير معروف'}
                </span>
              )}
              {isImage && (
                <span className={`text-xs px-2 py-1 rounded-full ${isUserMessage ? 'bg-blue-500/20 text-blue-600' : 'bg-gray-200 text-gray-700'}`}>
                  صورة {file.type?.split('/')[1]?.toUpperCase() || 'غير معروف'}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {file.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-xs ${textColor} hover:${isUserMessage ? 'bg-blue-500/20' : 'bg-gray-200'}`}
                  onClick={() => window.open(file.url, '_blank')}
                >
                  <Download className="h-4 w-4 ml-1" />
                  تنزيل
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                  onClick={onRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageFilePreview;
