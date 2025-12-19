# Data Collection Practices

This document explains exactly what data we collect from Reddit and why.

## Data We Collect

We collect ONLY public post data:

| Field | Description | Why We Need It |
|-------|-------------|----------------|
| `postId` | Reddit's post ID | Deduplication |
| `subreddit` | Which subreddit | Context |
| `title` | Post title | Understand the question |
| `content` | Post body | Understand the question |
| `author` | Username | Attribution |
| `url` | Link to post | Reference back to Reddit |
| `createdAt` | Timestamp | Freshness |
| `score` | Upvotes - Downvotes | Relevance |
| `numComments` | Comment count | Engagement level |

## Data We DO NOT Collect

| Data Type | Collected? | Reason |
|-----------|------------|--------|
| Email addresses | NO | Not available, not needed |
| Real names | NO | Not available, not needed |
| Private messages | NO | We don't request DM access |
| Voting history | NO | Not relevant to our use case |
| Browsing history | NO | Not available via API |
| Comments | NO | Only post content |
| User preferences | NO | Not available, not needed |
| IP addresses | NO | Not available via API |

## Data Flow

```
Reddit API
    │
    ▼
┌─────────────────┐
│ LeadOwl Collector│
│ - Searches posts │
│ - Filters noise  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ LeadOwl Database │
│ - Stores posts   │
│ - 90 day retention│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Human Review     │
│ - Team member   │
│ - Decides action │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Manual Response  │
│ - Human writes   │
│ - Posts manually │
└─────────────────┘
```

## Storage

- **Location**: Private database (not shared)
- **Encryption**: Data encrypted at rest
- **Access**: Only TechyOwls team members
- **Backups**: Encrypted, same retention policy

## Data Minimization

We follow the principle of data minimization:

1. **Collect only what we need** - No extra fields "just in case"
2. **Delete when no longer needed** - 90-day retention
3. **No data hoarding** - We don't archive old data

## Third-Party Sharing

We do NOT share data with:

- Advertisers
- Data brokers
- AI training companies
- Any third party

Data stays within TechyOwls for our internal use only.

## User Rights

Even though Reddit posts are public, we respect user rights:

- **Deletion requests**: If a Reddit user asks us to delete their data, we will
- **Opt-out**: Users can request we never collect their posts
- **Transparency**: This document explains our practices

## Contact

Questions about our data practices:

- Email: privacy@techyowls.io
- Website: https://leadowl.techyowls.io/privacy
