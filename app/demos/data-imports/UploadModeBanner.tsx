'use client';

interface UploadModeBannerProps {
  isProduction: boolean;
}

export function UploadModeBanner({ isProduction }: UploadModeBannerProps) {
  const isRealMode = !isProduction;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
      <div className="flex items-start gap-3">
        <span className="text-xl">ℹ️</span>
        <div className="flex-1">
          {/* Mode Status */}
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            {isRealMode ? 'Real Upload Mode' : 'Simulated Mode'}
          </h4>

          {/* Description */}
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {isRealMode ? (
              <>
                <strong>Real mode enabled:</strong> Files will be uploaded using chunked upload with FileReader API.
                Files are stored locally in <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.uploads/</code> and auto-deleted after 5 minutes.
              </>
            ) : (
              <>
                <strong>Simulated mode:</strong> Files are processed in your browser with realistic progress tracking.
                No data is sent to the server.
              </>
            )}
          </p>

          {/* Production Warning */}
          {isProduction && (
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                    Want to test real uploads to the backend?
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Real upload functionality is disabled in production for security. Download the repo to test chunked uploads,
                    FileReader API integration, and server-side file assembly locally.
                  </p>
                  <a
                    href="https://github.com/lokeam/uniform-lima"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Clone Repository
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}