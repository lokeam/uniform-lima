'use client';

import { useState, useRef } from 'react';

import { PageHeadline } from "@/components/layout/page-headline";
import { PageMain } from "@/components/layout/page-main";

import { UploadModeBanner } from '@/app/demos/data-imports/UploadModeBanner';

interface FileInfo {
  file: File;
  recordCount: number;
  preview?: string[];
}

export default function ManualUploadPage() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isRealUploadMode, setIsRealUploadMode] = useState<boolean>(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null);
  const [uploadEndTime, setUploadEndTime] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV to count records
  const parseCSV = async (file: File): Promise<{ recordCount: number; preview: string[] }> => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const recordCount = Math.max(0, lines.length - 1); // Subtract header
    const preview = lines.slice(0, 3); // First 3 lines for preview
    return { recordCount, preview };
  };

  // Process files in browser
  const processFiles = async (fileList: FileList | File[]) => {
    setIsProcessing(true);
    const newFiles: FileInfo[] = [];

    for (const file of Array.from(fileList)) {
      // Only process CSV files for this demo
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        const { recordCount, preview } = await parseCSV(file);
        newFiles.push({
          file,
          recordCount,
          preview,
        });
      } else {
        // For non-CSV files, just add them
        newFiles.push({
          file,
          recordCount: 0,
        });
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processFiles(e.dataTransfer.files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const handleRemove = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // NEW: Real upload function (chunked)
  const uploadFileReal = async (file: File): Promise<void> => {
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();

      fileReader.onload = async (ev) => {
        try {
          const buffer = ev.target?.result as ArrayBuffer;
          const chunkCount = Math.ceil(buffer.byteLength / CHUNK_SIZE);

          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

          for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
            const start = chunkIndex * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, buffer.byteLength);
            const chunk = buffer.slice(start, end);

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

            const progress = Math.round(((chunkIndex + 1) / chunkCount) * 100);
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }

          // Finalize
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

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('Failed to read file'));
      fileReader.readAsArrayBuffer(file);
    });
  };

  // Simulate upload with progress (duration based on file size)
  const simulateUpload = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      // Start at 0
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

      // Calculate realistic upload duration based on file size
      // Simulate ~2MB/sec upload speed (typical for decent connection)
      const fileSizeMB = file.size / (1024 * 1024);
      const uploadSpeedMBps = 2; // 2 MB per second
      const estimatedSeconds = Math.max(2, fileSizeMB / uploadSpeedMBps); // Minimum 2 seconds for visibility

      // Use smaller intervals for smoother updates, but sync with CSS transition
      const updateIntervalMs = 200; // Update every 200ms
      const totalDurationMs = estimatedSeconds * 1000;
      const totalUpdates = totalDurationMs / updateIntervalMs;
      // const progressPerUpdate = 100 / totalUpdates;

      let currentProgress = 0;
      let updateCount = 0;

      const interval = setInterval(() => {
        updateCount++;

        // Calculate expected progress based on time elapsed
        const expectedProgress = (updateCount / totalUpdates) * 100;

        // Add small random variance (±2%) to simulate network fluctuation
        const variance = (Math.random() - 0.5) * 4;
        currentProgress = Math.min(expectedProgress + variance, 99);

        if (updateCount >= totalUpdates) {
          // Reached the end - set to 99, then animate to 100
          setUploadProgress(prev => ({ ...prev, [file.name]: 99 }));
          clearInterval(interval);

          // Wait for final animation to complete
          setTimeout(() => {
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
            setTimeout(resolve, 200); // Small delay to show completion
          }, 500);
        } else {
          setUploadProgress(prev => ({ ...prev, [file.name]: currentProgress }));
        }
      }, updateIntervalMs);
    });
  };

  const handleUpload = async () => {
    setIsUploading(true);
    setUploadStartTime(Date.now());

    if (isRealUploadMode) {
      // Real chunked upload
      await Promise.all(
        files.map(fileInfo => uploadFileReal(fileInfo.file))
      );
    } else {
      console.log('🚀 Starting parallel upload for', files.length, 'files');
      // Simulated upload
      await Promise.all(
        files.map(fileInfo => simulateUpload(fileInfo.file))
      );
    }

    console.log('💾 All uploads complete! Saving to sessionStorage:', files);

    // Store files in sessionStorage (demo only)
    const fileData = files.map(f => ({
      name: f.file.name,
      size: f.file.size,
      recordCount: f.recordCount,
    }));

    console.log('📦 File data to save:', fileData);
    sessionStorage.setItem('uploadedFiles', JSON.stringify(fileData));
    console.log('✅ Saved to sessionStorage');

    // Show completion summary
    setIsUploading(false);
    setUploadEndTime(Date.now());
    setUploadComplete(true);
  };

  // Calculate totals
  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const totalRecords = files.reduce((sum, f) => sum + f.recordCount, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <PageMain>
      {/* Upload Mode Banner */}
      <UploadModeBanner
        isRealMode={isRealUploadMode}
        onToggle={setIsRealUploadMode}
      />

      {/* Info Banner */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-xl">📤</span>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Multi-File Upload Demo</h4>
            <p className="text-sm text-purple-800 dark:text-purple-200 mb-2">
              This demo showcases batch file uploads with real-time progress tracking and validation.
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer text-purple-700 dark:text-purple-300 hover:underline font-medium">
                How It Works
              </summary>
              <div className="mt-3 space-y-3 text-purple-700 dark:text-purple-300">
                <div>
                  <p className="font-medium mb-1">📋 Normal Upload Process:</p>
                  <ol className="ml-5 list-decimal space-y-1">
                    <li>User selects or drags files into the drop zone</li>
                    <li>Files are validated (type, size, duplicates)</li>
                    <li>Each file is uploaded to the server with progress tracking</li>
                    <li>Server processes and stores the files</li>
                  </ol>
                </div>
                <div>
                  <p className="font-medium mb-1">🎭 Simulation Mode (Default):</p>
                  <ul className="ml-5 list-disc space-y-1">
                    <li><strong>What:</strong> Simulates realistic upload behavior without server requests</li>
                    <li><strong>How:</strong> Uses JavaScript timers to mimic network latency and progress</li>
                    <li><strong>Speed:</strong> Calculates duration based on file size (~2MB/sec)</li>
                    <li><strong>Realism:</strong> Adds random variance (±2%) to simulate network fluctuations</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-1">⚡ Real Upload Mode: (only available locally)</p>
                  <ul className="ml-5 list-disc space-y-1">
                    <li>Uses FileReader API to read files as ArrayBuffer</li>
                    <li>Splits files into 5MB chunks for efficient transfer</li>
                    <li>Uploads chunks via POST to /api/upload/chunk</li>
                    <li>Server assembles chunks and stores in .uploads/ directory</li>
                    <li>Files auto-deleted after 5 minutes for demo purposes</li>
                  </ul>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      <PageHeadline
        title="Manual Upload"
        description="Upload files with drag-and-drop and progress tracking."
      >
        <h2>Manual Upload</h2>
      </PageHeadline>


      <div>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
          Drag and drop your files or click to browse
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".csv,.txt,.pdf,.jpg,.jpeg,.png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drop Zone - Always visible */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          files.length === 0 ? 'p-12' : 'p-6'
        } ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        }`}
      >
        {files.length === 0 ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: CSV, PDF, Images, Text files (Max 10 files)
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-2">📁</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag more files here or click to browse
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Selected files ({files.length}):</h4>
          </div>

          {files.map((fileInfo, index) => {
            const progress = uploadProgress[fileInfo.file.name] || 0;
            const isComplete = progress === 100;
            const isUploading = progress > 0 && progress < 100;

            return (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isComplete ? (
                        <span className="text-green-600 dark:text-green-400">✓</span>
                      ) : isUploading ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="text-gray-400">○</span>
                      )}
                      <span className="font-medium text-sm">{fileInfo.file.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatSize(fileInfo.file.size)}
                      {fileInfo.recordCount > 0 && (
                        <> • {fileInfo.recordCount.toLocaleString()} records</>
                      )}
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      onClick={() => handleRemove(index)}
                      disabled={isUploading}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {(isUploading || isComplete) && progress > 0 && (
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-[width] duration-500 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {isUploading && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Uploading... {Math.round(progress)}%
                      </div>
                    )}
                  </div>
                )}

                {isComplete && progress === 100 && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Upload complete
                  </div>
                )}
              </div>
            );
          })}

          {/* Totals */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Total:</strong> {files.length} {files.length === 1 ? 'file' : 'files'}, {formatSize(totalSize)}
              {totalRecords > 0 && <>, ~{totalRecords.toLocaleString()} cases</>}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isProcessing || isUploading}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Processing files...
        </div>
      )}
    </PageMain>
  );
}