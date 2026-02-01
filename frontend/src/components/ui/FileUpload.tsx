import React, { useRef, useState } from 'react';
import { Upload, File, FileText, X, Download } from 'lucide-react';

interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface FileUploadProps {
  files: FileAttachment[];
  onFilesChange: (files: FileAttachment[]) => void;
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesChange,
  maxSizeMB = 10 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
    ];

    const newFiles: FileAttachment[] = [];

    Array.from(selectedFiles).forEach(file => {
      // Validate file size
      if (file.size > maxSizeBytes) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSizeMB}MB.`);
        return;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} type is not allowed. Only PDF, Word, and Text files are accepted.`);
        return;
      }

      // Create file object URL for preview (in real app, upload to server)
      const fileUrl = URL.createObjectURL(file);
      
      const attachment: FileAttachment = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
      };

      newFiles.push(attachment);
    });

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemoveFile = (fileId: string) => {
    onFilesChange(files.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type === 'application/pdf') return <FileText className="text-red-500" size={24} />;
    if (type.includes('word')) return <FileText className="text-blue-500" size={24} />;
    return <File className="text-[var(--color-text-muted)]" size={24} />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging 
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' 
            : 'border-[var(--color-border)] hover:border-[var(--color-primary)]'
          }
        `}
      >
        <Upload className="mx-auto mb-3 text-[var(--color-text-muted)]" size={32} />
        <p className="text-sm text-[var(--color-text-primary)] mb-1">
          <span className="text-[var(--color-primary)] font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          PDF, Word, or Text files (Max {maxSizeMB}MB)
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.csv"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Attached Files ({files.length})
          </p>
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-[var(--color-surface-light)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
            >
              {getFileIcon(file.type)}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {file.name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={file.url}
                  download={file.name}
                  className="p-1.5 hover:bg-[var(--color-surface)] rounded transition-colors"
                  title="Download"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={16} className="text-[var(--color-text-muted)]" />
                </a>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-1.5 hover:bg-[var(--color-danger)]/10 rounded transition-colors"
                  title="Remove"
                >
                  <X size={16} className="text-[var(--color-danger)]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
