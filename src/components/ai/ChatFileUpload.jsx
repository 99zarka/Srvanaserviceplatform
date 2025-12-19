import React, { useRef, useState } from 'react';

const ChatFileUpload = ({ children, onFileUpload }) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > maxSize) {
        alert('حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت.');
        continue;
      }

      // Check file type
      const allowedTypes = [
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('نوع الملف غير مدعوم. يرجى رفع صور أو مستندات PDF فقط.');
        continue;
      }

      // Add preview URL
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file)
      });

      validFiles.push(fileWithPreview);
    }

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    handleFileChange(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileChange(files);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className="relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      <div 
        onClick={openFileDialog}
        className={`cursor-pointer transition-all duration-200 ${
          isDragging ? 'opacity-70' : ''
        }`}
      >
        {children}
      </div>

      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center">
          <div className="text-center text-blue-600">
            <div className="text-sm font-medium">أفلت الملفات هنا</div>
            <div className="text-xs text-blue-500">لرفعها إلى المحادثة</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFileUpload;
