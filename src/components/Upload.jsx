import { useState, useRef, useCallback } from 'react';

const ACCEPTED = '.txt,.csv,.tsv';

export default function Upload({ onFileLoaded, isProcessing }) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => onFileLoaded(e.target.result, file.name);
      reader.readAsText(file);
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      handleFile(e.target.files[0]);
    },
    [handleFile]
  );

  return (
    <div className="animate-fade-in-up">
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Upload Data
      </h3>

      <div
        className={`upload-zone relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer
          transition-all duration-300 group
          ${
            dragOver
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 drag-over'
              : 'border-slate-300 dark:border-slate-600 hover:border-brand-400'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          id="file-upload"
          type="file"
          accept={ACCEPTED}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center
            group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-6 h-6 text-brand-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>

          {fileName ? (
            <div>
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                {fileName}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Click or drop to replace
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Drop your coordinate file here
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                .txt · .csv · .tsv
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
        Format: <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">lat,lon</code> or{' '}
        <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">lat lon [id]</code>{' '}
        per line. Header row auto-detected.
      </p>
    </div>
  );
}
