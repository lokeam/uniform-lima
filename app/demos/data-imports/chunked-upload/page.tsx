'use client';

import { useState } from 'react';

// Custom components
import { UploadModeBanner } from '@/app/demos/data-imports/UploadModeBanner';

interface UploadFile {
  file: File;
  uploadId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export default function ChunkedUploadPage() {
  const [isRealUploadMode, setIsRealUploadMode] = useState<boolean>(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFileInChunks = async (uploadFile: UploadFile) => {
    const { file, uploadId } = uploadFile;

    return new Promise<void>((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async (ev) => {
        try {
          const buffer = ev.target?.result as ArrayBuffer;
          const chunkCount = Math.ceil(buffer.byteLength / CHUNK_SIZE);

          console.log(`📦 Uploading ${file.name} in ${chunkCount} chunks`);

          // Upload chunks sequentially (could be parallel with Promise.all)
          for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, buffer.byteLength);
            const chunk = buffer.slice(start, end);

            // Upload chunk
            const response = await fetch('/api/upload/chunk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/octet-stream',
                'X-Upload-Id': uploadId,
                'X-Chunk-Index': chunkIndex.toString(),
                'X-Chunk-Count': chunkCount.toString(),
                'X-File-Name': file.name,
                'X-File-Type': file.type,
              },
              body: chunk,
            });

            if (!response.ok) {
              throw new Error(`Chunk ${chunkIndex} upload failed`);
            }

            // Update progress
            const progress = Math.round(((chunkIndex + 1) / chunkCount) * 100);
            setFiles(prev => prev.map(f =>
              f.uploadId === uploadId
                ? { ...f, progress, status: 'uploading' }
                : f
            ));

            console.log(`✅ Chunk ${chunkIndex + 1}/${chunkCount} uploaded (${progress}%)`);
          }

          // Finalize upload
          const finalizeResponse = await fetch('/api/upload/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uploadId,
              fileName: file.name,
              fileType: file.type,
            }),
          });

          if (!finalizeResponse.ok) {
            throw new Error('Failed to finalize upload');
          }

          const result = await finalizeResponse.json();
          console.log('🎉 Upload complete:', result);

          setFiles(prev => prev.map(f =>
            f.uploadId === uploadId
              ? { ...f, progress: 100, status: 'complete' }
              : f
          ));

          resolve();
        } catch (error) {
          console.error('Upload error:', error);
          setFiles(prev => prev.map(f =>
            f.uploadId === uploadId
              ? { ...f, status: 'error', error: String(error) }
              : f
          ));
          reject(error);
        }
      };

      fileReader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = (fileList: FileList) => {
    const newFiles: UploadFile[] = Array.from(fileList).map(file => ({
      file,
      uploadId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      status: 'pending' as const,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');

    // Upload files sequentially (or use Promise.all for parallel)
    for (const file of pendingFiles) {
      await uploadFileInChunks(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <UploadModeBanner
        isRealMode={isRealUploadMode}
        onToggle={setIsRealUploadMode}
      />
      {/* Info Banner */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Real Chunked Upload</h4>
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              This demo uses <strong>real chunked uploads</strong> with the FileReader API.
              Files are split into 5MB chunks and uploaded to the local server.
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-green-700 dark:text-green-300 hover:underline font-medium">
                Technical Details
              </summary>
              <ul className="mt-2 ml-5 list-disc space-y-1 text-green-700 dark:text-green-300">
                <li>FileReader API reads files as ArrayBuffer</li>
                <li>Files split into 5MB chunks</li>
                <li>Each chunk uploaded via POST to /api/upload/chunk</li>
                <li>Server assembles chunks in /api/upload/finalize</li>
                <li>Files stored in .uploads/ (auto-deleted after 5 min)</li>
                <li>Disabled in production (set ENABLE_UPLOADS=true to enable)</li>
              </ul>
            </details>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold">Chunked File Upload</h2>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => document.getElementById('file-input')?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        }`}
      >
        <div className="text-4xl mb-4">📁</div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Drag files here or click to browse
        </p>
        <p className="text-sm text-gray-500">
          Files will be uploaded in 5MB chunks
        </p>
      </div>

      <input
        id="file-input"
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Files ({files.length})</h3>

          {files.map((uploadFile) => (
            <div
              key={uploadFile.uploadId}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {uploadFile.status === 'complete' && <span className="text-green-600">✓</span>}
                  {uploadFile.status === 'uploading' && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {uploadFile.status === 'error' && <span className="text-red-600">✗</span>}
                  {uploadFile.status === 'pending' && <span className="text-gray-400">○</span>}
                  <span className="font-medium">{uploadFile.file.name}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {formatSize(uploadFile.file.size)}
                </span>
              </div>

              {uploadFile.status !== 'pending' && (
                <div className="space-y-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadFile.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {uploadFile.status === 'uploading' && `Uploading... ${uploadFile.progress}%`}
                    {uploadFile.status === 'complete' && 'Upload complete'}
                    {uploadFile.status === 'error' && `Error: ${uploadFile.error}`}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleUpload}
            disabled={files.every(f => f.status !== 'pending')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Upload Files
          </button>
        </div>
      )}
    </div>
  );
}