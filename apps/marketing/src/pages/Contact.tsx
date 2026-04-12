export function Contact() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="relative overflow-hidden border-b border-onyx-700 py-20">
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <span className="section-label">Get In Touch</span>
          <h1 className="display-lg mt-3 text-platinum-50">Contact Us.</h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact info */}
          <div className="flex flex-col gap-8">
            {[
              {
                label: 'Phone',
                value: '(555) 867-5309',
                sub: 'Mon–Sat 7 AM – 8 PM, Sun 9 AM – 5 PM',
                href: 'tel:+15558675309',
              },
              {
                label: 'Email',
                value: 'service@mooretires.test',
                sub: 'We reply within 2 business hours',
                href: 'mailto:service@mooretires.test',
              },
              {
                label: 'Address',
                value: '1420 Rubber Ave, Naugatuck, CT 06770',
                sub: 'Free parking in rear lot',
                href: 'https://maps.google.com',
              },
            ].map(({ label, value, sub, href }) => (
              <div key={label} className="flex gap-6 border border-onyx-700 bg-onyx-900 p-6">
                <div>
                  <p className="section-label mb-1">{label}</p>
                  <a
                    href={href}
                    className="font-display text-xl font-bold text-platinum-50 hover:text-flame-400 transition-colors"
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {value}
                  </a>
                  <p className="mt-1 text-xs text-platinum-600">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          <div className="min-h-64 border border-onyx-700 bg-onyx-800 flex items-center justify-center">
            <div className="text-center">
              <p className="font-display font-bold text-platinum-600 uppercase tracking-widest">Map</p>
              <p className="text-xs text-onyx-600 mt-1">Google Maps embed goes here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
