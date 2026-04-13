/**
 * Email notification service.
 * Uses nodemailer with SMTP configuration. Falls back to console logging
 * when SMTP is not configured (development mode).
 *
 * Wired for future phone/SMS notifications via the existing Twilio worker.
 */
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const host = process.env['SMTP_HOST'];
  const port = Number(process.env['SMTP_PORT'] || 587);
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];

  if (!host || !user || !pass) {
    console.warn('[notifications] SMTP not configured — emails will be logged to console');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

const FROM_ADDRESS = process.env['EMAIL_FROM'] || 'Moore Tires <noreply@mooretires.com>';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Send an email or log it if SMTP is not configured. */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const smtp = getTransporter();

  if (!smtp) {
    console.info(`[notifications] EMAIL → ${payload.to}`);
    console.info(`  Subject: ${payload.subject}`);
    console.info(`  Body: ${payload.text || payload.html.slice(0, 200)}`);
    return;
  }

  await smtp.sendMail({
    from: FROM_ADDRESS,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

// ─── Email Templates ──────────────────────────────────────────────────────────

const BRAND_COLOR = '#FF5500';
const BASE_URL = process.env['APP_URL'] || 'http://localhost:5173';

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:40px 20px">
<div style="background:#fff;border-radius:8px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,.1)">
<div style="text-align:center;margin-bottom:24px">
<span style="display:inline-block;background:${BRAND_COLOR};color:#fff;font-weight:700;font-size:18px;width:36px;height:36px;line-height:36px;border-radius:4px">M</span>
<span style="font-weight:700;font-size:16px;color:#111;margin-left:8px;vertical-align:middle">Moore Tires</span>
</div>
${body}
</div>
<p style="text-align:center;color:#999;font-size:12px;margin-top:24px">
Moore Tires Distribution · Washington State<br/>
This is an automated message — please do not reply directly.
</p>
</div>
</body></html>`;
}

export async function sendInviteEmail(
  to: string,
  inviterName: string,
  tempPassword: string,
  role: string
): Promise<void> {
  const loginUrl = `${BASE_URL}/login`;
  const roleName = role.replace(/_/g, ' ');

  const subject = "You have been invited to Moore Tires";
  const bodyHtml = [
    '<h2 style="color:#111;margin:0 0 12px">Welcome to Moore Tires</h2>',
    '<p style="color:#555;line-height:1.6">',
    `  ${inviterName} has invited you as a <strong>${roleName}</strong> on the Moore Tires platform.`,
    '</p>',
    '<p style="color:#555;line-height:1.6">Your temporary password is:</p>',
    '<div style="background:#f8f8f8;border:1px solid #e5e5e5;border-radius:6px;padding:12px 16px;font-family:monospace;font-size:16px;letter-spacing:1px;text-align:center;margin:16px 0">',
    `  ${tempPassword}`,
    '</div>',
    '<p style="color:#555;line-height:1.6">Please sign in and change your password immediately.</p>',
    '<div style="text-align:center;margin:24px 0">',
    `  <a href="${loginUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#fff;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px">Sign In</a>`,
    '</div>',
  ].join('\n');

  const bodyText = [
    `${inviterName} invited you to Moore Tires as a ${roleName}.`,
    `Temp password: ${tempPassword}`,
    `Sign in at: ${loginUrl}`,
  ].join('\n');

  await sendEmail({ to, subject, html: wrapHtml(bodyHtml), text: bodyText });
}

export async function sendLowStockAlertEmail(
  to: string,
  companyName: string,
  lowItems: { productName: string; currentQty: number; threshold: number }[]
): Promise<void> {
  const itemRows = lowItems
    .map((i) => {
      const color = i.currentQty === 0 ? '#dc2626' : '#f59e0b';
      return [
        '<tr>',
        `<td style="padding:8px 12px;border-bottom:1px solid #eee">${i.productName}</td>`,
        `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:${color};font-weight:600">${i.currentQty}</td>`,
        `<td style="padding:8px 12px;border-bottom:1px solid #eee">${i.threshold}</td>`,
        '</tr>',
      ].join('');
    })
    .join('');

  await sendEmail({
    to,
    subject: `Low Stock Alert — ${companyName}`,
    html: wrapHtml(`
      <h2 style="color:#111;margin:0 0 12px">Low Stock Alert</h2>
      <p style="color:#555;line-height:1.6">
        The following items for <strong>${companyName}</strong> are below their reorder threshold:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <thead>
          <tr style="background:#f8f8f8">
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#555">Product</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#555">Current</th>
            <th style="padding:8px 12px;text-align:left;font-weight:600;color:#555">Threshold</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="text-align:center;margin:24px 0">
        <a href="${BASE_URL}/tires" style="display:inline-block;background:${BRAND_COLOR};color:#fff;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px">
          Reorder Now
        </a>
      </div>
    `),
    text: `Low Stock Alert for ${companyName}: ${lowItems.map((i) => `${i.productName}: ${i.currentQty}/${i.threshold}`).join(', ')}`,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderId: string,
  total: number,
  itemCount: number
): Promise<void> {
  await sendEmail({
    to,
    subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
    html: wrapHtml(`
      <h2 style="color:#111;margin:0 0 12px">Order Confirmed</h2>
      <p style="color:#555;line-height:1.6">
        Your order has been received and is being processed.
      </p>
      <div style="background:#f8f8f8;border-radius:6px;padding:16px;margin:16px 0">
        <p style="margin:0;color:#555"><strong>Order:</strong> #${orderId.slice(-8).toUpperCase()}</p>
        <p style="margin:8px 0 0;color:#555"><strong>Items:</strong> ${itemCount}</p>
        <p style="margin:8px 0 0;color:#555"><strong>Total:</strong> $${total.toFixed(2)}</p>
      </div>
      <div style="text-align:center;margin:24px 0">
        <a href="${BASE_URL}/orders" style="display:inline-block;background:${BRAND_COLOR};color:#fff;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:14px">
          View Order
        </a>
      </div>
    `),
    text: `Order #${orderId.slice(-8).toUpperCase()} confirmed. ${itemCount} items, total $${total.toFixed(2)}.`,
  });
}

export async function sendOrderStatusEmail(
  to: string,
  orderId: string,
  status: string,
  trackingNumber?: string
): Promise<void> {
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
  const trackingLine = trackingNumber
    ? `<p style="margin:8px 0 0;color:#555"><strong>Tracking:</strong> ${trackingNumber}</p>`
    : '';

  await sendEmail({
    to,
    subject: `Order Update — #${orderId.slice(-8).toUpperCase()} ${statusLabel}`,
    html: wrapHtml(`
      <h2 style="color:#111;margin:0 0 12px">Order Update</h2>
      <p style="color:#555;line-height:1.6">
        Your order status has been updated.
      </p>
      <div style="background:#f8f8f8;border-radius:6px;padding:16px;margin:16px 0">
        <p style="margin:0;color:#555"><strong>Order:</strong> #${orderId.slice(-8).toUpperCase()}</p>
        <p style="margin:8px 0 0;color:#555"><strong>Status:</strong> <span style="color:${BRAND_COLOR};font-weight:600">${statusLabel}</span></p>
        ${trackingLine}
      </div>
    `),
    text: `Order #${orderId.slice(-8).toUpperCase()} is now ${statusLabel}.${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
  });
}
