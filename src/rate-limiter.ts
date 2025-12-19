/**
 * Rate Limiter for Reddit API
 *
 * IMPORTANT: We use CONSERVATIVE rate limits.
 *
 * Reddit allows: 60 requests/minute
 * We use: 30 requests/minute (50% of allowed)
 *
 * Why? Because we respect the platform and want to be good API citizens.
 * There's no benefit to pushing limits when we only need a small amount of data.
 */

import type { RateLimitConfig } from './types';

/**
 * Default rate limit configuration.
 *
 * These values are intentionally conservative:
 * - 30 req/min when Reddit allows 60
 * - Exponential backoff on any rate limit response
 * - Maximum 3 retries before giving up
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  // Reddit allows 60/min, we use 30 (50% of allowed)
  requestsPerMinute: 30,

  // Don't send more than 10 requests in a burst
  burstLimit: 10,

  // Double wait time on each retry
  backoffMultiplier: 2,

  // Maximum wait of 5 minutes before giving up
  maxBackoffMs: 5 * 60 * 1000,

  // Only retry 3 times
  maxRetries: 3,
};

/**
 * Token bucket rate limiter.
 *
 * This implementation ensures we never exceed our self-imposed limits,
 * even if multiple parts of the application make requests simultaneously.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly config: RateLimitConfig;

  constructor(config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG) {
    this.config = config;
    this.tokens = config.burstLimit;
    this.lastRefill = Date.now();
  }

  /**
   * Refill tokens based on time elapsed.
   * Tokens accumulate at requestsPerMinute rate.
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefill;
    const elapsedMinutes = elapsedMs / 60000;

    // Add tokens based on elapsed time
    const newTokens = elapsedMinutes * this.config.requestsPerMinute;
    this.tokens = Math.min(this.config.burstLimit, this.tokens + newTokens);
    this.lastRefill = now;
  }

  /**
   * Wait until a token is available, then consume it.
   *
   * This method blocks until it's safe to make a request.
   */
  async waitForToken(): Promise<void> {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Calculate how long to wait for next token
    const tokensNeeded = 1 - this.tokens;
    const minutesToWait = tokensNeeded / this.config.requestsPerMinute;
    const msToWait = Math.ceil(minutesToWait * 60000);

    console.log(`[RateLimiter] Waiting ${msToWait}ms for rate limit`);

    await this.sleep(msToWait);
    this.refillTokens();
    this.tokens -= 1;
  }

  /**
   * Calculate backoff delay for retries.
   *
   * Uses exponential backoff: 1s, 2s, 4s, etc.
   * Capped at maxBackoffMs (default 5 minutes).
   */
  getBackoffDelay(attempt: number): number {
    const baseDelay = 1000; // 1 second
    const delay = baseDelay * Math.pow(this.config.backoffMultiplier, attempt);
    return Math.min(delay, this.config.maxBackoffMs);
  }

  /**
   * Check if we should retry after an error.
   */
  shouldRetry(attempt: number): boolean {
    return attempt < this.config.maxRetries;
  }

  /**
   * Handle a rate limit response (HTTP 429).
   *
   * Waits for the specified time before allowing more requests.
   */
  async handleRateLimitResponse(retryAfterSeconds?: number): Promise<void> {
    const waitMs = retryAfterSeconds
      ? retryAfterSeconds * 1000
      : this.config.maxBackoffMs;

    console.log(`[RateLimiter] Rate limited. Waiting ${waitMs}ms`);

    // Reset tokens to 0 since we're rate limited
    this.tokens = 0;

    await this.sleep(waitMs);
  }

  /**
   * Get current rate limiter status for debugging.
   */
  getStatus(): { tokens: number; requestsPerMinute: number } {
    this.refillTokens();
    return {
      tokens: Math.floor(this.tokens),
      requestsPerMinute: this.config.requestsPerMinute,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Execute a function with rate limiting and retry logic.
 *
 * This is the main entry point for making rate-limited API calls.
 *
 * @example
 * ```typescript
 * const result = await withRateLimit(rateLimiter, async () => {
 *   return fetch('https://oauth.reddit.com/r/webdev/search');
 * });
 * ```
 */
export async function withRateLimit<T>(
  limiter: RateLimiter,
  fn: () => Promise<T>,
  options?: { onRetry?: (attempt: number, error: Error) => void }
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= DEFAULT_RATE_LIMIT_CONFIG.maxRetries; attempt++) {
    try {
      // Wait for rate limit token
      await limiter.waitForToken();

      // Execute the function
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if it's a rate limit error
      if (error instanceof RateLimitError) {
        await limiter.handleRateLimitResponse(error.retryAfter);
        continue;
      }

      // For other errors, use exponential backoff
      if (limiter.shouldRetry(attempt)) {
        const delay = limiter.getBackoffDelay(attempt);
        console.log(`[RateLimiter] Retry ${attempt + 1} after ${delay}ms`);

        options?.onRetry?.(attempt, lastError);

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Custom error for rate limit responses.
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}
