export default function LoadingSpinner({ message = 'Processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 animate-fade-in-up">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-[3px] border-brand-100 dark:border-brand-900" />
        <div className="absolute inset-0 w-10 h-10 rounded-full border-[3px] border-transparent border-t-brand-500 animate-spin-slow" />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse-soft">
        {message}
      </p>
    </div>
  );
}
