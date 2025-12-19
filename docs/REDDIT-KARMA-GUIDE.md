# Reddit Karma Building Guide

**For**: Pinky (TechyOwls Reddit account)
**Goal**: Build legitimate karma before API application
**Timeline**: 1-2 weeks of activity

---

## Step 1: Account Setup (Day 1)

1. **Login** to the TechyOwls Reddit account
2. **Verify email** if not already done (Settings → Account → Email)
3. **Add profile info**:
   - Avatar: TechyOwls logo or professional image
   - Banner: Optional
   - Bio: `Software engineers who ship. Building developer tools at techyowls.io`
4. **Join these subreddits**:
   - r/webdev
   - r/javascript
   - r/typescript
   - r/node
   - r/reactjs
   - r/programming
   - r/SaaS
   - r/indiehackers
   - r/selfhosted
   - r/devops

---

## Step 2: How Karma Works

| Action | Karma Type | Effectiveness |
|--------|------------|---------------|
| Upvoted comments | Comment karma | High |
| Upvoted posts | Post karma | Medium |
| Awards received | Award karma | Low priority |

**Focus on comments first** - easier to get upvotes on helpful comments than posts.

---

## Step 3: Daily Activity Plan

### Week 1: Comments Only (Build Trust)

**Daily tasks (15-20 min/day):**

1. **Browse** r/webdev, r/javascript, r/node sorted by "New" or "Rising"
2. **Find** posts where you can genuinely help:
   - Questions about JavaScript/TypeScript
   - "How do I..." posts
   - Debugging help requests
   - Tool recommendations
3. **Comment** with helpful, detailed answers
4. **Avoid** promotional content - no mentions of TechyOwls products yet

---

## Step 4: Comment Templates

### For debugging questions:
```
Had this same issue before. The problem is [X].

Try this:
[code snippet]

This works because [explanation].
```

### For "how do I" questions:
```
A few approaches:

1. [Option 1] - good for [use case]
2. [Option 2] - better if [condition]

I'd go with option 1 if [reasoning].
```

### For tool recommendations:
```
Depends on your needs:

- If you need [X], try [Tool A]
- For [Y], [Tool B] is solid
- [Tool C] is good for [Z]

I've used [Tool] for [use case] and it worked well.
```

---

## Step 5: Topics to Look For

Based on TechyOwls expertise, look for posts about:

| Topic | Subreddits | Why We Know This |
|-------|------------|------------------|
| Screenshot/image generation | r/webdev, r/node | SnapForge knowledge |
| API development | r/node, r/javascript | Backend expertise |
| TypeScript questions | r/typescript | Core skill |
| Mac development | r/macapps | Octa knowledge |
| SaaS building | r/SaaS, r/indiehackers | Business experience |
| Docker/deployment | r/devops, r/selfhosted | Infrastructure knowledge |
| PDF generation | r/webdev, r/node | DocForge knowledge |

### Example Search Queries

Search these in relevant subreddits:
- "how to take screenshots programmatically"
- "best way to generate PDF"
- "node api rate limiting"
- "typescript beginner question"
- "how to deploy docker"
- "saas mvp advice"
- "website monitoring"
- "api authentication"

---

## Step 6: Rules

### DO:
- Be genuinely helpful
- Give detailed, thoughtful answers
- Share code snippets when relevant
- Admit when you don't know something
- Upvote good content you see
- Reply to follow-up questions on your comments
- Take time to write quality responses

### DON'T:
- Spam links to TechyOwls
- Copy-paste generic answers
- Comment just to comment (no "great post!" comments)
- Argue or be negative
- Self-promote in first 2 weeks
- Post the same comment multiple times
- Use ChatGPT-style generic responses

---

## Step 7: Karma Milestones

| Karma | Timeline | What It Means |
|-------|----------|---------------|
| 10+ | Day 2-3 | Account is active |
| 50+ | Week 1 | Good standing |
| 100+ | Week 2 | Strong account |
| 500+ | Month 1 | Established member |

**For API application**: 50-100 karma is sufficient.

---

## Step 8: Progress Tracking

Keep a simple log (can use Notes app or spreadsheet):

```
Date       | Subreddit    | Post Title           | What I Said          | Upvotes
-----------|--------------|----------------------|----------------------|--------
Jan 20     | r/webdev     | "How to screenshot"  | Explained puppeteer  | +5
Jan 20     | r/node       | "Help with API"      | Shared code example  | +12
Jan 21     | r/typescript | "TS config question" | Explained tsconfig   | +3
```

---

## Step 9: After Karma is Built (Week 2+)

Once you have 50+ karma:

1. Can occasionally share TechyOwls blog articles (max 1/week, only if relevant)
2. Can mention products when directly relevant to questions
3. Notify Moshiour to proceed with Reddit API application

---

## Quick Start Checklist

- [ ] Login to TechyOwls Reddit account
- [ ] Verify email is confirmed
- [ ] Update profile with bio
- [ ] Join all 10 subreddits listed above
- [ ] Day 1: Write 3 helpful comments
- [ ] Day 2-7: Write 2-3 helpful comments daily
- [ ] Track progress in a log
- [ ] Reach 50+ karma
- [ ] Notify Moshiour when ready

---

## Example Good Comments

### Example 1: Debugging Help
> **Post**: "My Node.js API is returning 500 errors randomly"
>
> **Good comment**:
> "This usually happens with unhandled promise rejections. Check if you have async/await without try-catch blocks.
>
> Add this to your entry file to catch them:
> ```js
> process.on('unhandledRejection', (err) => {
>   console.error('Unhandled rejection:', err);
> });
> ```
>
> Also check your database connections - intermittent 500s often mean connection pool exhaustion."

### Example 2: Tool Recommendation
> **Post**: "What's the best way to generate PDFs from HTML?"
>
> **Good comment**:
> "Depends on your stack:
>
> - **Puppeteer** - Most accurate rendering, uses real Chrome. Heavier but pixel-perfect.
> - **wkhtmltopdf** - Lighter, good for simple documents
> - **PDFKit** - If you want to build PDFs programmatically without HTML
>
> For complex layouts with CSS, Puppeteer is usually the most reliable. For simple invoices/reports, wkhtmltopdf is faster."

### Example 3: Architecture Question
> **Post**: "How do you handle rate limiting in your APIs?"
>
> **Good comment**:
> "We use a token bucket algorithm with Redis:
>
> 1. Store request counts per API key in Redis
> 2. Use sliding window (not fixed) for smoother limits
> 3. Return `X-RateLimit-Remaining` header so clients know their status
> 4. 429 response with `Retry-After` header when exceeded
>
> Libraries like `rate-limiter-flexible` make this easy in Node."

---

## Contact

Questions? Ask Moshiour on Slack/Discord.

**Goal**: 50+ karma, then we apply for Reddit API.
