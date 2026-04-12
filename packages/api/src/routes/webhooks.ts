import { Router } from 'express';
import twilio from 'twilio';
import { Customer } from '@moore-tires/db';

export const webhooksRouter = Router();

/**
 * POST /api/v1/webhooks/twilio/opt-out
 * Validates Twilio request signature, then sets sms_opted_out = true on the Customer.
 * Twilio sends STOP/HELP/START replies to this endpoint.
 */
webhooksRouter.post('/twilio/opt-out', async (req, res, next) => {
  try {
    const signingSecret = process.env['TWILIO_WEBHOOK_SIGNING_SECRET'];
    const signature = req.headers['x-twilio-signature'];
    const url = `${process.env['API_URL'] ?? ''}/api/v1/webhooks/twilio/opt-out`;

    if (
      signingSecret &&
      typeof signature === 'string' &&
      !twilio.validateRequest(signingSecret, signature, url, req.body as Record<string, string>)
    ) {
      res.status(403).send('Forbidden');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const from = req.body?.From as string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const body = (req.body?.Body as string | undefined)?.toUpperCase().trim();

    if (from && body === 'STOP') {
      await Customer.findOneAndUpdate({ phone: from }, { smsOptedOut: true });
    }

    // Twilio expects a TwiML response
    res.type('text/xml').send('<Response></Response>');
  } catch (err) {
    next(err);
  }
});
