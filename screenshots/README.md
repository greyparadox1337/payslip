# Screenshots — PaySlip

Every image in this directory is a real capture of the running app. No mockups,
no generated art. If an image here did not come out of the app, it does not belong.

## Captured

### Desktop (1440x900, 2x DPI)
- `desktop/01-landing.png` — landing page, full scroll
- `desktop/02-pricing.png` — pricing
- `desktop/03-login.png` — sign in
- `desktop/04-signup.png` — sign up
- `desktop/05-about.png` — about
- `desktop/06-blog.png` — blog index
- `desktop/07-careers.png` — careers
- `desktop/08-components.png` — `/screenshots` component harness
- `desktop/09-transaction-success.png` — `TransactionSuccessCard`, element clip

### Mobile (390x844, 2x DPI)
- `mobile/01-landing-mobile.png`
- `mobile/02-pricing-mobile.png`
- `mobile/03-login-mobile.png`

## Still needed

These routes require an authenticated session (and a connected wallet), so they
have to be captured by hand while logged in:

- [ ] Employer dashboard — `/employer/dashboard`
- [ ] Payroll run + bulk disburse — `/employer/payroll`
- [ ] Employee list — `/employer/employees`
- [ ] Employee portal — `/employee/portal`

## How to recapture

```bash
npm run dev
```

Then either use the in-app guide at http://localhost:3000/screenshots, or capture
via Chrome DevTools (Cmd+Shift+P → "Capture full size screenshot") at a 1440x900
viewport with device scale factor 2.

The first run shows an onboarding overlay. Dismiss it once, or run
`localStorage.setItem("payslip-onboarded","true")` in the console before capturing.

Sections fade in via `IntersectionObserver` (`src/hooks/useScrollAnimation.ts`), so
scroll the whole page before a full-page capture or the lower sections come out blank.
