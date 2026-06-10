import { env } from "../../config/env";

const BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export interface SendVerificationEmailParams {
  to: string;
  username: string;
  token: string;
}

export interface SendPasswordResetEmailParams {
  to: string;
  username: string;
  token: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface BrevoEmailResponse {
  messageId?: string;
}

class EmailService {
  private getVerificationLink(token: string): string {
    const baseUrl = env.APP_FRONTEND_URL.replace(/\/$/, "");
    return `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
  }

  private getPasswordResetLink(token: string): string {
    const baseUrl = env.APP_FRONTEND_URL.replace(/\/$/, "");
    return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  }

  private isEmailProviderConfigured(): boolean {
    return Boolean(env.BREVO_API_KEY);
  }

  async sendMail(options: EmailOptions): Promise<void> {
    if (!env.BREVO_API_KEY) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[email] Brevo API key missing. Email sending skipped.");
        return;
      }

      console.error("[email] Brevo API key missing in production.");
      return;
    }

    console.info("[email] Sending via Brevo API", {
      to: options.to,
      subject: options.subject,
      senderEmail: env.BREVO_SENDER_EMAIL,
    });

    try {
      const response = await fetch(BREVO_EMAIL_ENDPOINT, {
        method: "POST",
        headers: {
          "api-key": env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: env.BREVO_SENDER_NAME,
            email: env.BREVO_SENDER_EMAIL,
          },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Brevo email send failed: ${response.status} ${response.statusText} ${errorBody}`,
        );
      }

      const result = (await response
        .json()
        .catch(() => null)) as BrevoEmailResponse | null;

      console.info("[email] Brevo email sent", {
        to: options.to,
        subject: options.subject,
        messageId: result?.messageId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[email] Brevo send failed", {
        to: options.to,
        subject: options.subject,
        message,
      });
      throw error;
    }
  }

  async sendVerificationEmail(
    params: SendVerificationEmailParams,
  ): Promise<void> {
    const verificationLink = this.getVerificationLink(params.token);
    const safeUsername = escapeHtml(params.username);

    if (!this.isEmailProviderConfigured() && process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] Verification link for ${params.to}: ${verificationLink}`,
      );
    }

    try {
      await this.sendMail({
        to: params.to,
        subject: "Verify your WC2026 Predictor email",
        html: `
<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your WC2026 Predictor email</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f7fa;color:#1f2933;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f5f7fa;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:720px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 14px rgba(17,24,39,0.08);">
            <tr>
              <td style="padding:32px 40px;background-color:#0b4f45;color:#ffffff;">
                <div style="font-size:24px;line-height:30px;font-weight:700;">WC2026 Predictor</div>
                <div style="font-size:14px;line-height:20px;color:#d1fae5;margin-top:6px;">Email Verification</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h1 style="margin:0 0 12px 0;font-size:28px;line-height:35px;font-weight:700;color:#111827;">Welcome to WC2026 Predictor</h1>
                <p style="margin:0 0 30px 0;font-size:17px;line-height:26px;font-weight:600;color:#374151;">Please verify your email address to activate your WC2026 Predictor account.</p>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:26px;color:#4b5563;">Hi ${safeUsername},</p>
                <p style="margin:0 0 28px 0;font-size:16px;line-height:26px;color:#4b5563;">Thanks for registering for WC2026 Predictor.<br />Please confirm your email address so we can finish setting up your account.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;">
                  <tr>
                    <td align="center" bgcolor="#047857" style="border-radius:8px;">
                      <a href="${verificationLink}" style="display:inline-block;padding:14px 28px;font-size:16px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#047857;">Verify Email</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:20px 0 28px 0;font-size:14px;line-height:22px;color:#6b7280;">For security reasons, this verification link will expire in 24 hours.</p>
                <p style="margin:0 0 10px 0;font-size:14px;line-height:22px;color:#4b5563;">If the button does not work, copy and paste this link into your browser:</p>
                <div style="margin:0 0 28px 0;padding:14px 16px;background-color:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;line-height:22px;color:#047857;word-break:break-all;">
                  <a href="${verificationLink}" style="color:#047857;text-decoration:underline;word-break:break-all;">${verificationLink}</a>
                </div>
                <p style="margin:0;padding:16px;background-color:#f9fafb;border-left:4px solid #0f766e;border-radius:10px;font-size:14px;line-height:22px;color:#4b5563;">If you did not create a WC2026 Predictor account, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:20px;text-align:center;">
                <div style="font-weight:700;color:#374151;">WC2026 Predictor</div>
                <div style="font-size:13px;color:#6b7280;">FIFA World Cup 2026 prediction game</div>
                <div style="font-size:13px;color:#6b7280;">Predict. Compete. Win.</div>
                <div style="margin-top:10px;font-size:13px;color:#6b7280;">This is an automated email, please do not reply.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `.trim(),
        text: [
          "Welcome to WC2026 Predictor",
          "",
          `Hi ${params.username},`,
          "",
          "Please verify your email address to activate your WC2026 Predictor account.",
          "",
          "Verify your email:",
          verificationLink,
          "",
          "For security reasons, this verification link will expire in 24 hours.",
          "",
          "If you did not create a WC2026 Predictor account, you can safely ignore this email.",
          "",
          "WC2026 Predictor",
          "FIFA World Cup 2026 prediction game",
        ].join("\n"),
      });

      if (this.isEmailProviderConfigured()) {
        console.log(`[email] Verification email sent to ${params.to}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[email] Failed to send verification email to ${params.to}: ${message}`,
      );
    }
  }

  async sendPasswordResetEmail(
    params: SendPasswordResetEmailParams,
  ): Promise<void> {
    const resetLink = this.getPasswordResetLink(params.token);
    const safeUsername = escapeHtml(params.username);

    if (!this.isEmailProviderConfigured() && process.env.NODE_ENV !== "production") {
      console.warn(`[email] Password reset link for ${params.to}: ${resetLink}`);
    }

    try {
      await this.sendMail({
        to: params.to,
        subject: "Reset your WC2026 Predictor password",
        html: `
<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your WC2026 Predictor password</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f5f7fa;color:#1f2933;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#f5f7fa;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:720px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 14px rgba(17,24,39,0.08);">
            <tr>
              <td style="padding:32px 40px;background-color:#0b4f45;color:#ffffff;">
                <div style="font-size:24px;line-height:30px;font-weight:700;">WC2026 Predictor</div>
                <div style="font-size:14px;line-height:20px;color:#d1fae5;margin-top:6px;">Password Reset</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h1 style="margin:0 0 12px 0;font-size:28px;line-height:35px;font-weight:700;color:#111827;">Reset your password</h1>
                <p style="margin:0 0 30px 0;font-size:17px;line-height:26px;font-weight:600;color:#374151;">Use this secure link to choose a new WC2026 Predictor password.</p>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:26px;color:#4b5563;">Hi ${safeUsername},</p>
                <p style="margin:0 0 28px 0;font-size:16px;line-height:26px;color:#4b5563;">We received a request to reset your WC2026 Predictor password. Click the button below to continue.</p>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0;">
                  <tr>
                    <td align="center" bgcolor="#047857" style="border-radius:8px;">
                      <a href="${resetLink}" style="display:inline-block;padding:14px 28px;font-size:16px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#047857;">Reset Password</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:20px 0 28px 0;font-size:14px;line-height:22px;color:#6b7280;">For security reasons, this password reset link will expire in 24 hours.</p>
                <p style="margin:0 0 10px 0;font-size:14px;line-height:22px;color:#4b5563;">If the button does not work, copy and paste this link into your browser:</p>
                <div style="margin:0 0 28px 0;padding:14px 16px;background-color:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;line-height:22px;color:#047857;word-break:break-all;">
                  <a href="${resetLink}" style="color:#047857;text-decoration:underline;word-break:break-all;">${resetLink}</a>
                </div>
                <p style="margin:0;padding:16px;background-color:#f9fafb;border-left:4px solid #0f766e;border-radius:10px;font-size:14px;line-height:22px;color:#4b5563;">If you did not request a password reset, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:13px;line-height:20px;text-align:center;">
                <div style="font-weight:700;color:#374151;">WC2026 Predictor</div>
                <div style="font-size:13px;color:#6b7280;">FIFA World Cup 2026 prediction game</div>
                <div style="font-size:13px;color:#6b7280;">Predict. Compete. Win.</div>
                <div style="margin-top:10px;font-size:13px;color:#6b7280;">This is an automated email, please do not reply.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `.trim(),
        text: [
          "Reset your WC2026 Predictor password",
          "",
          `Hi ${params.username},`,
          "",
          "We received a request to reset your WC2026 Predictor password.",
          "",
          "Reset your password:",
          resetLink,
          "",
          "For security reasons, this password reset link will expire in 24 hours.",
          "",
          "If you did not request a password reset, you can safely ignore this email.",
          "",
          "WC2026 Predictor",
          "FIFA World Cup 2026 prediction game",
        ].join("\n"),
      });

      if (this.isEmailProviderConfigured()) {
        console.log(`[email] Password reset email sent to ${params.to}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[email] Failed to send password reset email to ${params.to}: ${message}`,
      );
    }
  }
}

export const emailService = new EmailService();
