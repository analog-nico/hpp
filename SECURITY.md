# Security Policy

## Supported Versensions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2   | :x:                |

## Reporting a Vulnerability

Please **do not open a public issue or pull request** for security vulnerabilities.

Report vulnerabilities privately through GitHub's Private Vulnerability Reporting:

- **Report a vulnerability:** https://github.com/analog-nico/hpp/security/advisories/new

Please include:

- a description of the issue and its security impact,
- affected versions and environment details,
- steps to reproduce or a proof-of-concept, and
- a suggested fix if available.

### Response expectations

- We aim to acknowledge a report within **7 days**.
- After triage we will provide a remediation and disclosure timeline.
- Reporters who submit valid findings will be credited in the published advisory or release notes.

## Security hardening

This middleware removes duplicate query/body parameters that can be abused for HTTP
Parameter Pollution (HPP). If you believe a parameter shape (including nested or
non-`array` encodings) bypasses the middleware, please report it through the
private channel above.
