# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

- Email: security@techyowls.io
- Do NOT create a public GitHub issue

We will respond within 48 hours and work to address the issue promptly.

## Security Practices

### Credentials

- Reddit API credentials are stored in environment variables
- Credentials are NEVER committed to the repository
- Access tokens are short-lived and refreshed automatically

### Data Security

- All data is encrypted at rest
- Database access is restricted to authenticated services
- No sensitive data is logged

### Network Security

- All API calls use HTTPS
- No plaintext transmission of credentials
- OAuth tokens are stored securely

### Code Security

- Dependencies are regularly updated
- No known vulnerabilities in dependencies
- Code is reviewed before merging

## Scope

This security policy applies to:

- The LeadOwl Reddit Monitor codebase
- Our internal infrastructure
- Data we collect and store

## Not In Scope

- Reddit's infrastructure
- Third-party services we integrate with
- User's own systems

## Updates

This security policy may be updated periodically. Check the commit history for changes.
