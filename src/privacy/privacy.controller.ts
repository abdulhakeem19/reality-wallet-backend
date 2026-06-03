import { Controller, Get, Header } from '@nestjs/common';

// Public privacy policy page. Served as plain semantic HTML (no inline CSS)
// so it isn't blocked by helmet's default Content-Security-Policy.
const LAST_UPDATED = '3 June 2026';
const CONTACT_EMAIL = 'abdulhakeem@versagcc.com';

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Affora — Privacy Policy</title>
</head>
<body>
<h1>Privacy Policy — Affora</h1>
<p><em>Last updated: ${LAST_UPDATED}</em></p>

<p>Affora ("we", "the app") helps you understand and manage your personal
finances. This policy explains what we collect, why, and your choices.</p>

<h2>Information we collect</h2>
<p><strong>Account information (via Google Sign-In).</strong> When you sign in we
receive your name, email address, and profile picture from Google. We use this
to create and identify your account.</p>
<p><strong>Financial information you enter.</strong> Your salary, committed
expenses (bills, EMIs), transactions, savings goals, debts, streaks, and related
notes. You provide this directly; we do not import it from your bank.</p>
<p><strong>Household information.</strong> If you link a household, we store the
household membership and invite code so you and your partner can share goals.</p>

<h2>How your data is stored</h2>
<p>Your data is stored locally on your device and synced to your account on our
secure backend so it is preserved across devices and reinstalls. All network
traffic uses HTTPS.</p>

<h2>How we use your data</h2>
<p>To provide the app's features (budgets, goals, gamification, household
sharing) and to authenticate you. We do <strong>not</strong> sell your data or
use it for advertising.</p>

<h2>Sharing</h2>
<p>Google processes your sign-in (see Google's Privacy Policy). Linked household
partners can see shared household goals you choose to create. We do not share
your personal financial data with any other third party, except where required
by law.</p>

<h2>Data retention and deletion</h2>
<p>You can clear all local data at any time from <strong>Profile &rarr; Clear All
Data</strong>, and sign out to remove your session from the device. To delete
your server-side account and household data, contact us at the email below.</p>

<h2>Permissions</h2>
<p><strong>Notifications / Exact alarms</strong> — daily money-ritual reminders.
<strong>Biometric</strong> — optional app lock. <strong>Internet</strong> — sign
in and sync.</p>

<h2>Children</h2>
<p>Affora is not directed at children under 13 and we do not knowingly collect
their data.</p>

<h2>Changes</h2>
<p>We may update this policy; material changes will be reflected by the "Last
updated" date above.</p>

<h2>Contact</h2>
<p>Questions or deletion requests: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>
</body>
</html>`;

@Controller()
export class PrivacyController {
  @Get('privacy')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'public, max-age=3600')
  privacy(): string {
    return PAGE;
  }
}
