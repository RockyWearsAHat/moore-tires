export function About() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="relative overflow-hidden border-b border-onyx-700 py-20">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <span className="section-label">Our Story</span>
          <h1 className="display-lg mt-3 text-platinum-50">
            Built on the<br />
            <span className="text-flame-500">Road.</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="text-lg leading-loose text-platinum-400">
              Moore Tires was founded in 2009 by Carl Moore, a third-generation mechanic who believed tire service deserved the same precision as a race pit crew — without the race prices.
            </p>
            <p className="mt-6 leading-loose text-platinum-600">
              What started as a single bay shop has grown into a full-service operation with mobile units covering the whole metro area. One thing has not changed: every job gets treated like it is the car we drive home.
            </p>
            <p className="mt-6 leading-loose text-platinum-600">
              In 2023 we launched real-time dispatching and SMS updates so customers stop wondering where their tech is. We think communication is the actual job — the tire work is just the result.
            </p>
          </div>

          <div className="flex flex-col gap-px bg-onyx-700">
            {[
              { year: '2009', event: 'Founded in a single-bay shop' },
              { year: '2014', event: 'Expanded to three bays + alignment rack' },
              { year: '2018', event: 'Launched mobile service fleet' },
              { year: '2023', event: 'Real-time SMS dispatch platform goes live' },
              { year: '2025', event: '12,000th tire installed' },
            ].map(({ year, event }) => (
              <div key={year} className="flex gap-6 bg-onyx-900 px-8 py-6 hover:bg-onyx-800 transition-colors">
                <span className="font-display text-2xl font-black text-flame-500 opacity-70 w-16 flex-shrink-0">{year}</span>
                <span className="text-platinum-400 self-center">{event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
