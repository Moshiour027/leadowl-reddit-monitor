# Rate Limiting Implementation

This document explains how we implement rate limiting to respect Reddit's API.

## Our Approach: Conservative by Default

We don't push limits. We use significantly less than what's allowed.

| Metric | Reddit Allows | We Use | % of Allowed |
|--------|---------------|--------|--------------|
| Requests/minute | 60 | 30 | 50% |
| Burst requests | - | 10 | - |

## Why So Conservative?

1. **We don't need more** - 30 req/min is plenty for 12 subreddits
2. **Respect for the platform** - Reddit provides a service, we should be good citizens
3. **Reliability** - Running at 50% means we're never at risk of hitting limits
4. **Future-proofing** - If limits decrease, we're still fine

## Implementation Details

### Token Bucket Algorithm

We use a token bucket rate limiter:

```typescript
const config = {
  requestsPerMinute: 30,  // 50% of Reddit's 60/min
  burstLimit: 10,         // Max requests in a burst
  backoffMultiplier: 2,   // Double wait time on retry
  maxBackoffMs: 300000,   // Max 5 minute wait
  maxRetries: 3,          // Give up after 3 attempts
};
```

### How It Works

1. **Tokens refill** at 30 per minute
2. **Each request** consumes 1 token
3. **If no tokens**, wait until one is available
4. **Never exceed** 30 requests per minute

### Error Handling

When we receive a rate limit response (HTTP 429):

```
1. Stop all requests immediately
2. Read Retry-After header
3. Wait the specified time (or 5 minutes if not specified)
4. Resume with exponential backoff
```

### Exponential Backoff

On errors, we back off exponentially:

| Attempt | Wait Time |
|---------|-----------|
| 1 | 1 second |
| 2 | 2 seconds |
| 3 | 4 seconds |
| 4+ | Give up |

## Code Reference

See `src/rate-limiter.ts` for the full implementation.

Key functions:

- `waitForToken()` - Blocks until safe to make request
- `handleRateLimitResponse()` - Handles 429 responses
- `getBackoffDelay()` - Calculates retry delays

## Monitoring

We log rate limiter status:

```
[RateLimiter] Waiting 2000ms for rate limit
[RateLimiter] Rate limited. Waiting 60000ms
[RateLimiter] Retry 1 after 1000ms
```

## Guarantees

1. **We will never exceed 60 requests/minute** - Hard limit in code
2. **We target 30 requests/minute** - Half of allowed
3. **We respect 429 responses** - Always wait as instructed
4. **We don't retry aggressively** - Max 3 retries with backoff

## Testing

Our rate limiter is tested to ensure:

- Tokens refill at correct rate
- Requests are blocked when tokens exhausted
- 429 responses trigger proper waiting
- Backoff is calculated correctly
