export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black backdrop-blur-sm bg-opacity-90">
      
      {/* Code Brackets Loader */}
      <div className="flex items-center gap-2 text-4xl md:text-6xl font-light text-accent font-mono mb-8">
        <span className="animate-bounce" style={{ animationDelay: "0ms" }}>{"{"}</span>
        <span className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse"></span>
        <span className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "200ms" }}></span>
        <span className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse" style={{ animationDelay: "400ms" }}></span>
        <span className="animate-bounce" style={{ animationDelay: "150ms" }}>{"}"}</span>
      </div>

      <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] animate-pulse font-mono">
        Compiling...
      </p>

    </div>
  );
}
