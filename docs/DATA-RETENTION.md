# Data Retention Policy

This document explains how long we keep data and how we delete it.

## Retention Period

**90 days** - All collected data is automatically deleted after 90 days.

## Why 90 Days?

- **Long enough** to follow up on conversations
- **Short enough** to not hoard old data
- **Industry standard** for social monitoring tools

## Automatic Deletion

We run automated deletion daily:

```sql
DELETE FROM leads
WHERE collected_at < NOW() - INTERVAL '90 days';
```

This ensures:
- No manual intervention required
- Consistent enforcement
- Data doesn't accumulate indefinitely

## What Gets Deleted

After 90 days, we delete:

- Post content
- Post titles
- Author usernames
- URLs
- All metadata

**Complete deletion** - Not anonymization, actual deletion.

## User-Requested Deletion

Reddit users can request deletion of their data before 90 days:

1. Email privacy@techyowls.io
2. Include your Reddit username
3. We delete within 72 hours

## No Archives

We do NOT:

- Create backups older than 90 days
- Archive data for historical analysis
- Keep "anonymized" versions
- Export data before deletion

When 90 days pass, the data is gone.

## Legal Compliance

Our retention policy complies with:

- **GDPR** (EU General Data Protection Regulation)
- **CCPA** (California Consumer Privacy Act)
- **Reddit API Terms** (no indefinite storage)

## Audit Trail

We maintain logs of:

- When deletion jobs run
- How many records were deleted
- Any failures in deletion

This ensures accountability without retaining user data.

## Contact

Questions about data retention:

- Email: privacy@techyowls.io
- Website: https://leadowl.techyowls.io/privacy
