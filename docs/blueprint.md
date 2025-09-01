# **App Name**: Fortress Auth

## Core Features:

- Email/Password Login: Allow users to register and log in using their email address and password, with Firebase Auth.
- Email Verification: Implement Firebase email verification to ensure the user's email address is valid.
- SMS OTP Verification: Enable SMS OTP verification using Firebase Phone Auth to send one-time passwords via SMS for enhanced security.
- Email Link Verification: Provide an option for users to receive a one-time verification link via email as an alternative authentication method.
- TOTP App Authentication: Integrate TOTP (Time-Based One-Time Password) app authentication, allowing users to scan a QR code and link their account to an authenticator app.
- MFA Setup: Guide users through the process of setting up multi-factor authentication after the primary login, offering them a choice of SMS, Email, or TOTP.
- Intelligent MFA Step-Up: Dynamically prompt users for MFA based on risk assessments.  The assessment will use the User's IP, geolocation and prior activity, managed via a tool to flag suspicious login attempts that will trigger a second factor authentication request.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) for a sense of security and trust.
- Background color: Very light lavender (#F0F8FF) for a clean and calming interface.
- Accent color: Bright Violet (#9400D3) to highlight interactive elements and calls to action.
- Body font: 'Inter', a grotesque-style sans-serif with a modern look, suitable for both headlines and body text.
- Code font: 'Source Code Pro' for displaying code snippets related to MFA setup or troubleshooting.
- Use minimalist line icons to represent different MFA methods (SMS, Email, TOTP).
- Subtle animations during authentication processes (e.g., loading, verification, success).