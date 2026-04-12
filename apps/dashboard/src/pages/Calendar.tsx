export function CalendarPage() {
  const today = new Date();
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM – 6 PM

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between border-b border-surface-border bg-[#0D0F14] px-6 py-4">
        <div>
          <h1 className="font-display font-bold text-xl uppercase tracking-wider text-gray-100">Calendar</h1>
          <p className="text-xs text-gray-500">
            {today.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded border border-surface-border px-3 py-1.5 text-xs text-gray-400 hover:text-gray-100 hover:border-gray-500 transition-colors">
            ← Prev
          </button>
          <button type="button" className="rounded bg-brand-500/10 border border-brand-500/30 px-3 py-1.5 text-xs font-semibold text-brand-400 hover:bg-brand-500/20 transition-colors">
            Today
          </button>
          <button type="button" className="rounded border border-surface-border px-3 py-1.5 text-xs text-gray-400 hover:text-gray-100 hover:border-gray-500 transition-colors">
            Next →
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {/* Day grid */}
        <div className="min-w-[700px]">
          <div className="flex text-xs text-gray-600 mb-1 ml-12">
            {['Alex M.', 'Jordan K.', 'Sam T.'].map((tech) => (
              <div key={tech} className="flex-1 text-center pb-2 border-b border-surface-border">{tech}</div>
            ))}
          </div>

          {hours.map((hour) => (
            <div key={hour} className="flex">
              <div className="w-12 flex-shrink-0 pr-3 text-right text-[10px] text-gray-700 pt-2">
                {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'a' : 'p'}
              </div>
              {['Alex M.', 'Jordan K.', 'Sam T.'].map((tech) => (
                <div
                  key={tech}
                  className="flex-1 border-b border-l border-surface-border h-16 first:border-l-0 hover:bg-surface-elevated/30 transition-colors"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
