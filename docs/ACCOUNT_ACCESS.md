# Account verification and recovery

These workflows run locally without choosing a hosting, database hosting, or email provider. Real inbox delivery still needs a configured transactional email service.

## Verification

- Registration creates an unverified account and a verification email.
- Members can request another email from `/verify-email`, linked from registration and sign-in.
- Newly generated links expire after 24 hours. Resending replaces the previous token; only the newest link works.
- The page requires an explicit verification action, then offers sign-in. Opening the page alone does not verify an account.
- Invalid, expired, and already-used links offer another request. Already-verified members can sign in directly.
- Older development links generated before expiry was implemented must be replaced using resend.

## Password recovery

- `/forgot-password` requests a reset email. Links expire after one hour.
- `/reset-password` requires a matching password confirmation and a password of 12–128 characters. The server independently enforces password length.
- Completing recovery consumes the token and invalidates all existing sessions. Members must sign in again with the new password.
- Recovery does not verify an unverified account; that member still needs to verify their email before signing in.
- Invalid, expired, and already-used reset links point back to the request form.

## Abuse controls and API coverage

Verification resend and reset requests return the same message for eligible, unknown, and already-verified email addresses. Per-address limits apply to every request: one request per minute bucket and three per hour bucket, in addition to the public action limits. Response wording does not reveal whether an account exists; timing-based detection and deployment-wide abuse protection still need staging review.

Verification and reset actions have token-specific limits and transaction locks. REST authentication endpoints use these guarded workflows. User GraphQL operations are disabled to prevent alternate authentication mutations bypassing them; the application and administration use REST.

Provider failures are logged without recipient addresses or tokens. Full delivery monitoring, automatic retries, and deployed abuse controls remain launch work.

## Local review

Without Resend or SMTP, emails are saved to the ignored `.data/mail` directory. Use the newest relevant verification or reset URL; the interface states that no inbox email will arrive. Do not commit, publish, or copy account links into public logs.

Follow [Resend setup](RESEND_SETUP.md) to receive emails during development. Alternatively, set `EMAIL_FROM_ADDRESS` alongside SMTP settings. Public links use `NEXT_PUBLIC_SERVER_URL`.

Changing account email, deletion requests, and association membership verification remain separate unfinished workflows. They are tracked in the launch-readiness checklist.

## Admin sessions and baskets

Admin and public pages share the same account session within a browser. Signing in to administration also signs that browser into the public site. The same account's saved basket is available in other browsers where that account is signed in.

Guest baskets remain in that browser's separate guest storage. Account basket contents are not written into guest storage. Signing out returns to the guest basket, and returning to a public tab after a session change refreshes its account status. The old mixed browser cache is discarded because it has no reliable ownership information; saved account baskets remain in the database.
