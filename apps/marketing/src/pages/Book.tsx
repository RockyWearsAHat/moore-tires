import { useState } from 'react';
import { IntakeForm } from '@moore-tires/ui';
import { type CreateServiceRequestInput } from '@moore-tires/shared';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function Book() {
  const [state, setState] = useState<SubmitState>('idle');
  const [apiError, setApiError] = useState<string>();

  const handleSubmit = async (data: CreateServiceRequestInput) => {
    setState('submitting');
    setApiError(undefined);

    try {
      const res = await fetch('/api/v1/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'same-origin',
      });

      if (res.status === 201) {
        setState('success');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const msg = String(body?.error?.message ?? 'Something went wrong. Please try again.');
      setApiError(msg);
      setState('error');
    } catch {
      setApiError('Network error. Please check your connection and try again.');
      setState('error');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Page header */}
      <div className="relative overflow-hidden py-20 border-b border-onyx-700">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,85,0,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,85,0,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <span className="section-label">Appointments</span>
          <h1 className="display-lg mt-3 text-platinum-50">Book Service.</h1>
          <p className="body-lg mt-4 max-w-lg">
            Fill in the form and we'll confirm your appointment within the hour.
            You'll get an SMS as soon as your request is received.
          </p>
        </div>
      </div>

      {/* Form / Success */}
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        {state === 'success' ? (
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-flame-500/10 border border-flame-500/30">
              <svg className="h-8 w-8 text-flame-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="display-md text-platinum-50">Request Received</h2>
            <p className="body-lg mt-4">
              Check your phone — an SMS confirmation is on its way. We'll reach out shortly to confirm your appointment time.
            </p>
            <button
              type="button"
              onClick={() => setState('idle')}
              className="flame-btn mt-8"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <div className="grid gap-16 lg:grid-cols-[1fr_400px]">
            {/* Why choose us */}
            <div className="order-2 lg:order-1">
              <h2 className="display-md text-platinum-50 mb-8">Why Moore Tires?</h2>
              <ul className="flex flex-col gap-6">
                {[
                  { icon: '⚡', title: 'Fast Turnaround', body: 'Most services completed in under an hour. Your time matters.' },
                  { icon: '📍', title: 'Mobile Service', body: 'Toggle the mobile option and our tech comes to you — driveway, office, or roadside.' },
                  { icon: '💬', title: 'Real-Time Updates', body: "We'll text you when your tech is en route and when the job is done." },
                  { icon: '🔒', title: 'Transparent Pricing', body: 'No hidden fees, no upsell pressure. Every charge explained upfront.' },
                ].map(({ icon, title, body }) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center bg-onyx-800 border border-onyx-700 text-xl" aria-hidden="true">{icon}</span>
                    <div>
                      <h3 className="font-display font-bold uppercase tracking-wide text-platinum-100">{title}</h3>
                      <p className="mt-1 text-sm text-platinum-600">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <div className="order-1 rounded-none border border-onyx-700 bg-onyx-800 p-8 lg:order-2">
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-platinum-50 mb-6">
                Service Request
              </h2>
              <IntakeForm
                onSubmit={handleSubmit}
                isSubmitting={state === 'submitting'}
                apiError={apiError}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
