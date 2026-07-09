import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MapView from './components/MapView';
import { parseCoordinates } from './utils/parser';
import { findClosestPair } from './utils/closestPair';

const LARGE_FILE_THRESHOLD = 5000; // lines

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('pba-dark') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  const [parseResult, setParseResult] = useState(null);
  const [closestPair, setClosestPair] = useState(null);
  const [computeTime, setComputeTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const workerRef = useRef(null);

  /* Dark mode class on <html> */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pba-dark', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  /* Process file: use worker for large files, inline for small */
  const handleFileLoaded = useCallback((text, fileName) => {
    setIsProcessing(true);
    setStatusMessage('Parsing file...');
    setParseResult(null);
    setClosestPair(null);
    setComputeTime(null);

    const lineCount = text.split('\n').length;

    if (lineCount > LARGE_FILE_THRESHOLD) {
      // Use Web Worker for large files
      if (workerRef.current) workerRef.current.terminate();

      const worker = new Worker(
        new URL('./workers/compute.worker.js', import.meta.url),
        { type: 'module' }
      );
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, data, message } = e.data;

        if (type === 'status') {
          setStatusMessage(message);
        }
        if (type === 'parseResult') {
          setParseResult(data);
          if (data.points.length >= 2) {
            worker.postMessage({
              type: 'compute',
              payload: { points: data.points },
            });
          } else {
            setIsProcessing(false);
            setStatusMessage('');
          }
        }
        if (type === 'computeResult') {
          setClosestPair(data);
          setComputeTime(data.computeTime);
          setIsProcessing(false);
          setStatusMessage('');
          worker.terminate();
          workerRef.current = null;
        }
        if (type === 'error') {
          console.error('Worker error:', message);
          setIsProcessing(false);
          setStatusMessage('');
          worker.terminate();
          workerRef.current = null;
        }
      };

      worker.postMessage({ type: 'parse', payload: { text } });
    } else {
      // Inline processing for small files
      requestAnimationFrame(() => {
        try {
          const result = parseCoordinates(text);
          setParseResult(result);

          if (result.points.length >= 2) {
            setStatusMessage('Computing closest pair...');
            requestAnimationFrame(() => {
              const start = performance.now();
              const pair = findClosestPair(result.points);
              const elapsed = performance.now() - start;
              setClosestPair(pair);
              setComputeTime(elapsed);
              setIsProcessing(false);
              setStatusMessage('');
            });
          } else {
            setIsProcessing(false);
            setStatusMessage('');
          }
        } catch (err) {
          console.error('Parse error:', err);
          setIsProcessing(false);
          setStatusMessage('');
        }
      });
    }
  }, []);

  /* Cleanup worker on unmount */
  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen bg-surface-50 dark:bg-surface-900 overflow-hidden">
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onFileLoaded={handleFileLoaded}
        parseResult={parseResult}
        closestPair={closestPair}
        computeTime={computeTime}
        isProcessing={isProcessing}
        statusMessage={statusMessage}
      />

      {/* Map area */}
      <main className="flex-1 relative min-h-[50vh] lg:min-h-0">
        <MapView
          points={parseResult?.points}
          closestPair={closestPair}
          darkMode={darkMode}
        />

        {/* Overlay when no data loaded */}
        {!parseResult && !isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[500]">
            <div className="glass rounded-2xl px-8 py-6 text-center max-w-sm animate-fade-in-up">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                No Data Loaded
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload a coordinate file to visualize parcel boundaries and find the closest pair of points.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
