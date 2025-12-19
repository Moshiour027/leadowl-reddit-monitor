# LeadOwl Reddit Monitor

> Customer feedback monitoring for indie software developers.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## What This Is

LeadOwl Reddit Monitor helps software developers find and respond to community questions about their products. When someone on Reddit asks "looking for a screenshot API" or "best Mac calculator app", we help the makers of those tools find and answer these questions.

## Who We Are

**TechyOwls** is a small software company (3 people) building developer tools:

| Product | Description | Status |
|---------|-------------|--------|
| [SnapForge](https://snapforge.techyowls.io) | Screenshot API | Live, revenue-generating |
| [Octa](https://octa.techyowls.io) | Mac Calculator | Live on App Store |
| [WatchOwl](https://watchowl.techyowls.io) | Visual Monitoring | In development |
| [DocForge](https://docforge.techyowls.io) | PDF Generation API | In development |

Our products are discussed on Reddit. We built this tool to find those discussions and provide helpful responses to users asking questions.

## Why We Need Reddit API Access

Our use case is simple:

1. **Monitor** - Watch developer subreddits for keywords related to our products
2. **Notify** - Alert our team when users ask relevant questions
3. **Respond** - Enable human (not automated) responses to help users

### Example Flow

```
1. User posts on r/webdev: "Looking for a reliable screenshot API"

2. LeadOwl finds this post (matches keyword "screenshot API")

3. Our team member sees the notification

4. Human reviews the post and decides to respond

5. Human manually responds on Reddit with helpful information
```

**No automation. No spam. Just developers helping developers.**

## What We Do

- Search public subreddits for product-related keywords
- Store public post data temporarily (90-day retention)
- Notify our team about relevant discussions
- Enable human responses to community questions

## What We DON'T Do

- Send automated posts, comments, or DMs
- Collect personal or private information
- Sell or share data with third parties
- Train AI models on Reddit content
- Scrape or archive Reddit content
- Exceed rate limits (we use 30/min, 50% of the allowed 60/min)
- Access private subreddits or DMs

## Technical Implementation

### Rate Limiting

We implement **conservative** rate limiting well below Reddit's allowances:

| Metric | Reddit Allows | We Use |
|--------|---------------|--------|
| Requests/minute | 60 | 30 (50%) |
| Burst limit | - | 10 requests |
| Backoff on 429 | Required | Exponential up to 5 min |
| Retry attempts | - | Max 3 |

See [docs/RATE-LIMITING.md](docs/RATE-LIMITING.md) for implementation details.

### Data Collection

We collect only **public** post data:

```typescript
interface CollectedData {
  postId: string;        // Reddit's public post ID
  subreddit: string;     // Public subreddit name
  title: string;         // Public post title
  content: string;       // Public post body
  author: string;        // Public username
  url: string;           // Link back to Reddit
  createdAt: Date;       // Post timestamp
}
```

We do NOT collect:
- Emails or personal contact info
- Private messages
- User browsing history
- Upvote/downvote patterns
- Any non-public information

See [docs/DATA-COLLECTION.md](docs/DATA-COLLECTION.md) for complete details.

### Data Retention

- **90-day retention** - Posts older than 90 days are automatically deleted
- **User deletion requests** - We honor deletion requests within 72 hours
- **No archives** - We don't maintain historical archives

See [docs/DATA-RETENTION.md](docs/DATA-RETENTION.md) for our retention policy.

## Subreddits We Monitor

We monitor a small, focused list of developer communities:

- r/webdev
- r/SaaS
- r/startups
- r/node
- r/reactjs
- r/selfhosted
- r/indiehackers
- r/programming
- r/macapps
- r/devops
- r/typescript
- r/javascript

**12 subreddits total** - Not broad crawling, just communities where our users are.

## Keywords We Search

Related to our products:

```
SnapForge: "screenshot api", "webpage capture", "url to image"
Octa: "mac calculator", "developer calculator", "programmer calculator"
General: "looking for", "recommend", "alternative to"
```

See [src/collector.ts](src/collector.ts) for the complete list.

## Compliance

### Legal
- **Privacy Policy**: https://leadowl.techyowls.io/privacy
- **Terms of Service**: https://leadowl.techyowls.io/terms
- **GDPR Compliant**: EU user data handled according to GDPR

### Technical
- **Rate Limiting**: 50% of allowed limits
- **Error Handling**: Exponential backoff, graceful degradation
- **Caching**: 15-minute cache to reduce API calls

### Ethical
- **Read-Only**: We only read, never automate posting
- **Human Responses**: All Reddit responses are written by humans
- **Transparent**: This repo shows exactly what we do

## Project Structure

```
src/
├── reddit-client.ts   # Reddit API client with OAuth
├── rate-limiter.ts    # Conservative rate limiting
├── collector.ts       # Post collection logic
└── types.ts           # TypeScript interfaces

docs/
├── PURPOSE.md         # Why this tool exists
├── DATA-COLLECTION.md # What data we collect
├── DATA-RETENTION.md  # How long we keep data
├── RATE-LIMITING.md   # Rate limit implementation
└── PRIVACY.md         # Privacy practices

examples/
└── sample-response.json # Example API response
```

## Running Locally

```bash
# Install dependencies
npm install

# Set environment variables
export REDDIT_CLIENT_ID=your_client_id
export REDDIT_CLIENT_SECRET=your_client_secret

# Run collector
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REDDIT_CLIENT_ID` | Reddit app client ID | Yes |
| `REDDIT_CLIENT_SECRET` | Reddit app client secret | Yes |
| `REDDIT_USER_AGENT` | User agent string | Yes |

## License

MIT License - See [LICENSE](LICENSE) for details.

## Contact

- **Company**: TechyOwls
- **Website**: https://techyowls.io
- **Email**: hello@techyowls.io
- **Developer**: Moshiour Rahman

## Verification

Everything we claim is verifiable:

| Claim | Verification |
|-------|--------------|
| Real company | https://techyowls.io |
| Real products | https://snapforge.techyowls.io, App Store (Octa) |
| Real team | LinkedIn: Moshiour Rahman |
| Real code | This repository |

---

*Built by indie developers, for indie developers.*
