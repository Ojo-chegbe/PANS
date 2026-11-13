# Connect Resend

The app sends verification, password-reset, and queued notification emails through the Resend HTTP API when `RESEND_API_KEY` is configured. Resend takes priority over SMTP. If neither is set, local development keeps messages in `.data/mail`. In production, missing email configuration or the Resend test sender blocks email operations and returns a temporary-unavailability response for registration and account-link requests; public pages and existing-account sign-in remain available.

## Receive emails now, without a domain

1. Create or sign in to your account at [Resend](https://resend.com).
2. Open [API Keys](https://resend.com/api-keys) and create a key with **Sending access**. Use a separate key for this app.
3. In a PowerShell terminal in this project, run:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/configure-resend.ps1
   ```

   Paste the key into the hidden prompt. It is saved to the ignored `.env.local` file, without changing database settings. Do not send API keys in chat or commit them.

4. Restart the app, then use **Resend verification email** or **Forgot your password?** with the same email address you used for your Resend account. Creating an account also sends its verification email.

The sender is `PANS UNIJOS <onboarding@resend.dev>`. This sender can deliver only to your Resend account email. It cannot send to arbitrary test users or other members. See [Resend's recipient restriction](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain).

Existing local-outbox messages are not automatically sent. Request a fresh link. Public links use `NEXT_PUBLIC_SERVER_URL`; with localhost links, open them on the computer running the app.

## Once you have a domain

Verify the domain in [Resend Domains](https://resend.com/domains), adding the DNS records Resend supplies. Then rerun the setup script with your sender address:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/configure-resend.ps1 -SenderAddress noreply@your-domain.com
```

Use a domain-restricted sending key where appropriate and set the deployed `NEXT_PUBLIC_SERVER_URL`. Production email delivery rejects the `resend.dev` test sender.

For local testing, the same settings can be entered directly in `.env.local`:

```dotenv
RESEND_API_KEY=your_real_api_key
EMAIL_FROM_ADDRESS=onboarding@resend.dev
EMAIL_FROM_NAME=PANS UNIJOS
```

For a hosted deployment, set `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS` (for example, `noreply@your-domain.com` on a domain verified in Resend), and `EMAIL_FROM_NAME` in the hosting provider's private environment settings for the target deployment environment, then redeploy. Do not copy `onboarding@resend.dev` into production. Setting a sender address does not verify its domain; complete the DNS verification in Resend first.

## If a message does not arrive

- Check Resend's **Emails** dashboard. API acceptance does not guarantee inbox placement; check delivery status and spam.
- With the test sender, confirm the recipient is exactly your Resend account email.
- Check the API key's sending permission, sender domain verification and account limits.
- The app logs network failures or Resend's HTTP status and error code without logging API keys, email bodies, recipient addresses or account tokens. It does not silently divert rejected Resend emails to the local outbox.

Do not expose `.data/mail` publicly. Delivery webhooks, operational alerts and comprehensive retry handling remain separate launch tasks.
