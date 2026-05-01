export function CalendarPage() {
  const today = new Date();
  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM – 6 PM

  return (
    <div className="flex flex-col h-full">
      <header className="page-header flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="font-display theme-text-strong text-xl font-bold uppercase tracking-wider">Calendar</h1>
          <p className="theme-text-faint text-xs">
            {today.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="theme-button-secondary rounded px-3 py-1.5 text-xs">
            ← Prev
          </button>
          <button type="button" className="theme-button-primary rounded px-3 py-1.5 text-xs font-semibold">
            Today
          </button>
          <button type="button" className="theme-button-secondary rounded px-3 py-1.5 text-xs">
            Next →
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        {/* Day grid */}
        <div className="min-w-[700px]">
          <div className="theme-text-faint mb-1 ml-12 flex text-xs">
            {['Alex M.', 'Jordan K.', 'Sam T.'].map((tech) => (
              <div key={tech} className="flex-1 text-center pb-2 border-b border-surface-border">{tech}</div>
            ))}
          </div>

          {hours.map((hour) => (
            <div key={hour} className="flex">
              <div className="theme-text-faint w-12 flex-shrink-0 pt-2 pr-3 text-right text-[10px]">
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
