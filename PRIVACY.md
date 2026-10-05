# Privacy and Compliance Management

This project includes comprehensive privacy and compliance tooling for managing subscriber consent, data requests, retention policies, and audit logging.

## Features

### Consent Management
- **Consent Records**: Track consent with timestamp, source, and policy version
- **Double Opt-In**: Email-based confirmation flow for subscriber consent
- **Consent Status**: Query confirmation status across consent types (marketing, analytics, tracking, profiling)
- **Revocation**: Subscribers can revoke consent with optional reason tracking

### Privacy Requests
- **Data Export**: Request and download personal data in accessible format
- **Anonymization**: Replace personally identifiable information with anonymized identifiers
- **Account Deletion**: Soft-delete subscriber accounts and data
- **Verification**: Email-based token verification before processing requests
- **Request Status**: Track progress of privacy requests

### Data Retention
- **Retention Policies**: Configurable retention windows for different data types
  - Inactive subscriptions (default: 365 days)
  - Unconfirmed consent records (default: 30 days)
  - Privacy requests (default: 24 hours)
  - Audit logs (default: 90 days)
- **Automated Cleanup**: Scheduled retention policy execution
- **Policy Management**: Create, update, and manage retention policies

### Audit Logging
- **Privacy Actions**: Log all privacy-related actions (consent, export, delete, etc.)
- **Sensitive Data Protection**: Automatic redaction of sensitive fields
- **Admin Access**: Query audit logs by action, date range, or email
- **Compliance Trail**: Maintain compliance audit trail for data subject requests

### Security
- **Rate Limiting**: Stricter limits on privacy endpoints to prevent abuse
  - Privacy requests: 5 per hour per IP
  - Consent operations: 10 per 15 minutes per IP
  - Verification: 3 per hour per IP
- **Token Hashing**: Verification tokens are hashed and not stored in plain text
- **IP Tracking**: Request originating IP address is logged
- **Expiration**: Time-limited verification tokens (24 hours default)

## API Endpoints

### Consent Management

**Create Consent Record** (Double opt-in flow)
```
POST /api/privacy/consent
{
  "email": "user@example.com",
  "consentType": "marketing",
  "policyVersion": "1.0.0"
}
```

**Confirm Consent**
```
POST /api/privacy/consent/confirm
{
  "email": "user@example.com",
  "token": "verification_token_from_email"
}
```

**Get Consent Status**
```
GET /api/privacy/consent/status/:email
```

**Revoke Consent**
```
POST /api/privacy/consent/revoke
{
  "email": "user@example.com",
  "consentType": "marketing",
  "reason": "no longer interested"
}
```

### Privacy Requests

**Request Data Export**
```
POST /api/privacy/request/export
{
  "email": "user@example.com"
}
```

**Request Anonymization**
```
POST /api/privacy/request/anonymize
{
  "email": "user@example.com"
}
```

**Request Account Deletion**
```
POST /api/privacy/request/delete
{
  "email": "user@example.com"
}
```

**Verify Privacy Request**
```
POST /api/privacy/request/verify
{
  "email": "user@example.com",
  "token": "verification_token_from_email"
}
```

**Check Request Status**
```
GET /api/privacy/request/status/:requestId
```

### Admin Operations

**View Audit Logs**
```
GET /api/privacy/admin/audit-logs?action=consent_confirmed&startDate=2024-01-01&endDate=2024-12-31&limit=100
```

**Execute Retention Cleanup**
```
POST /api/privacy/admin/execute-retention-cleanup
```

## Environment Variables

```env
# Privacy & Compliance Configuration
PRIVACY_POLICY_VERSION=1.0.0
PRIVACY_RETENTION_INACTIVE_DAYS=365
PRIVACY_RETENTION_PENDING_CONSENT_DAYS=30
PRIVACY_RETENTION_AUDIT_LOG_DAYS=90
CLIENT_URL=http://localhost:3030

# Email Configuration (required for consent/request notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
```

## Operational Responsibilities

- **Product/Admin Teams**: Review and approve privacy policy versions
- **Engineering**: Maintain privacy request verification flow and audit logging
- **Operations**: 
  - Review retention cleanup results
  - Respond to export/anonymization requests
  - Monitor audit logs for suspicious activity
- **Security**: Validate that no sensitive values are logged in audit records

## Testing

### Test Consent Flow
1. POST to `/api/privacy/consent` with email, consentType
2. Check email for verification link
3. POST to `/api/privacy/consent/confirm` with token
4. GET `/api/privacy/consent/status/:email` to confirm

### Test Privacy Request Flow
1. POST to `/api/privacy/request/export` with email
2. Check email for verification link
3. POST to `/api/privacy/request/verify` with token
4. GET `/api/privacy/request/status/:requestId` to track progress

### Test Admin Functions
1. POST to `/api/privacy/admin/execute-retention-cleanup` to trigger cleanup
2. GET `/api/privacy/admin/audit-logs` to view all privacy actions

## Data Privacy by Design

- **Minimal Storage**: Only essential subscriber data is retained
- **Sensitive Field Protection**: Passwords and tokens are redacted from audit logs
- **Automatic Expiration**: Verification tokens and pending requests expire
- **Audit Trail**: All privacy operations are logged for compliance
- **Easy Deletion**: Subscribers can request complete data deletion
- **Easy Export**: Subscribers can access their data in accessible format

## Integration with Newsletter Application

Privacy routes are integrated into the Express backend at `/api/privacy` and work seamlessly with existing subscription and newsletter features.

## Notes

- All verification tokens are time-limited (default: 24 hours)
- Download links for exported data are also time-limited (default: 48 hours)
- Audit logs do not store sensitive data (passwords, tokens are redacted)
- IP addresses are tracked for security purposes
- Subscriber anonymization uses SHA-256 hashing of email
