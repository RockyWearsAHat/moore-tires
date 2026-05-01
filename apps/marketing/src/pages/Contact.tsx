import { useState } from 'react';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      // In production this would POST to /api/v1/contact.
      // For now simulate a network delay so the UI states are exercised.
      await new Promise<void>((res) => setTimeout(res, 800));
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const field = (
    id: keyof typeof form,
    label: string,
    type: string = 'text',
    placeholder: string = ''
  ) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="section-label">{label}</label>
      <input
        id={id}
        type={type}
        value={form[id]}
        onChange={(e) => setForm((f) => ({ ...f, [id]: e.target.value }))}
        placeholder={placeholder}
        required
        className="border border-onyx-700 bg-onyx-900 px-4 py-3 text-sm text-platinum-100 placeholder:text-platinum-700 outline-none focus:border-flame-500 transition-colors"
      />
    </div>
  );

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

          {/* Contact form */}
          {status === 'sent' ? (
            <div className="flex items-center justify-center border border-onyx-700 bg-onyx-900 p-12">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-flame-500">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="font-display text-xl font-bold text-platinum-50">Message Sent</h2>
                <p className="mt-2 text-sm text-platinum-600">We'll reply within 2 business hours.</p>
                <button
                  type="button"
                  onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', message: '' }); }}
                  className="mt-6 border border-onyx-600 px-6 py-2 text-sm text-platinum-400 hover:text-platinum-100 hover:border-onyx-500 transition-colors"
                >
                  Send Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-5 border border-onyx-700 bg-onyx-900 p-8" noValidate>
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-platinum-50">
                Send a Message
              </h2>

              {field('name', 'Full Name', 'text', 'Jane Smith')}
              {field('email', 'Email Address', 'email', 'jane@example.com')}
              {field('phone', 'Phone Number', 'tel', '(555) 000-0000')}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="section-label">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us how we can help…"
                  required
                  className="border border-onyx-700 bg-onyx-900 px-4 py-3 text-sm text-platinum-100 placeholder:text-platinum-700 outline-none focus:border-flame-500 transition-colors resize-none"
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-400">Something went wrong — please try again or call us directly.</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="mt-2 bg-flame-500 px-8 py-3 font-display text-sm font-bold uppercase tracking-wider text-white hover:bg-flame-600 active:scale-[0.98] disabled:opacity-60 transition"
              >
                {status === 'sending' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
