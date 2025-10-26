'use client';

interface UploadModeBannerProps {
  isRealMode: boolean;
  onToggle: (isReal: boolean) => void;
  disabled?: boolean;
}

export function UploadModeBanner({ isRealMode, onToggle, disabled = false }: UploadModeBannerProps) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDisabled = disabled || isProduction;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">ℹ️</span>
        <div className="flex-1">
          {/* Toggle Row */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              Real Upload
            </h4>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRealMode}
                onChange={(e) => onToggle(e.target.checked)}
                disabled={isDisabled}
                className="sr-only peer"
              />
              <div className={`
                w-11 h-6 rounded-full peer
                peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                ${isDisabled
                  ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 peer-checked:bg-blue-600'
                }
                after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                after:bg-white after:rounded-full after:h-5 after:w-5
                after:transition-all peer-checked:after:translate-x-full
              `} />
            </label>
          </div>

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
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ⚠️ Testing real upload functionality is disabled in production.
                To test upload functionality, please clone the repo{' '}
                <a
                  href="https://github.com/yourusername/uniform-lima"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-blue-900 dark:hover:text-blue-100 font-medium"
                >
                  here
                </a>
                {' '}and build locally.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}