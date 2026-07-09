import Upload from './Upload';
import ResultsPanel from './ResultsPanel';
import Legend from './Legend';
import LoadingSpinner from './LoadingSpinner';

export default function Sidebar({
  darkMode,
  toggleDarkMode,
  onFileLoaded,
  parseResult,
  closestPair,
  computeTime,
  isProcessing,
  statusMessage,
}) {
  return (
    <aside
      className="w-full lg:w-[380px] flex-shrink-0 h-full flex flex-col
        bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl
        border-r border-slate-200/70 dark:border-slate-700/50
        overflow-hidden z-10"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                Parcel Boundary
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Analyzer
              </p>
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700
              transition-all duration-200 group"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg
                className="w-[18px] h-[18px] text-amber-400 group-hover:rotate-45 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-[18px] h-[18px] text-slate-500 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        <Upload onFileLoaded={onFileLoaded} isProcessing={isProcessing} />

        {isProcessing && <LoadingSpinner message={statusMessage || 'Processing...'} />}

        <ResultsPanel
          parseResult={parseResult}
          closestPair={closestPair}
          computeTime={computeTime}
        />

        {parseResult && <Legend />}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
        <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center">
          Parcel Boundary Analyzer &middot; Client-side analysis
        </p>
      </div>
    </aside>
  );
}
