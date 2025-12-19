/**
 * Reddit API Client
 *
 * This client implements Reddit's OAuth2 API for searching public posts.
 *
 * IMPORTANT NOTES:
 * - We only use READ operations (search, fetch posts)
 * - We do NOT post, comment, vote, or message
 * - We respect rate limits (see rate-limiter.ts)
 * - We only access PUBLIC data
 */

import { RateLimiter, withRateLimit, RateLimitError } from './rate-limiter';
import type {
  RedditPost,
  RedditSearchResponse,
  RedditTokenResponse,
} from './types';

/**
 * Reddit API client configuration.
 */
export interface RedditClientConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

/**
 * Reddit API client with OAuth authentication.
 *
 * Usage:
 * ```typescript
 * const client = new RedditClient({
 *   clientId: process.env.REDDIT_CLIENT_ID,
 *   clientSecret: process.env.REDDIT_CLIENT_SECRET,
 *   userAgent: 'LeadOwl/1.0.0 (https://leadowl.techyowls.io)',
 * });
 *
 * const posts = await client.search('screenshot api', ['webdev', 'SaaS']);
 * ```
 */
export class RedditClient {
  private readonly config: RedditClientConfig;
  private readonly rateLimiter: RateLimiter;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private readonly BASE_URL = 'https://oauth.reddit.com';
  private readonly AUTH_URL = 'https://www.reddit.com/api/v1/access_token';

  constructor(config: RedditClientConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter();
  }

  /**
   * Authenticate with Reddit using OAuth2 client credentials.
   *
   * We use the "script" app type which uses client credentials flow.
   * This only grants READ access to public data.
   */
  private async authenticate(): Promise<void> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return;
    }

    console.log('[RedditClient] Authenticating with Reddit OAuth...');

    const credentials = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString('base64');

    const response = await fetch(this.AUTH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.config.userAgent,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status}`);
    }

    const data: RedditTokenResponse = await response.json();

    this.accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    console.log('[RedditClient] Authentication successful');
  }

  /**
   * Make an authenticated request to Reddit API.
   *
   * This method:
   * 1. Ensures we have a valid OAuth token
   * 2. Respects rate limits
   * 3. Handles errors gracefully
   */
  private async request<T>(endpoint: string): Promise<T> {
    await this.authenticate();

    return withRateLimit(this.rateLimiter, async () => {
      const url = `${this.BASE_URL}${endpoint}`;

      console.log(`[RedditClient] GET ${endpoint}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'User-Agent': this.config.userAgent,
        },
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '60',
          10
        );
        throw new RateLimitError('Rate limited by Reddit', retryAfter);
      }

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      return response.json();
    });
  }

  /**
   * Search for posts matching a query.
   *
   * @param query - Search query (e.g., "screenshot api")
   * @param subreddits - Subreddits to search in
   * @param options - Search options
   * @returns Array of matching posts
   *
   * @example
   * ```typescript
   * const posts = await client.search('screenshot api', ['webdev', 'SaaS'], {
   *   timeRange: 'day',
   *   limit: 25,
   * });
   * ```
   */
  async search(
    query: string,
    subreddits: string[],
    options: {
      timeRange?: 'hour' | 'day' | 'week' | 'month';
      limit?: number;
    } = {}
  ): Promise<RedditPost[]> {
    const { timeRange = 'day', limit = 25 } = options;

    const allPosts: RedditPost[] = [];

    for (const subreddit of subreddits) {
      try {
        const endpoint =
          `/r/${subreddit}/search.json?` +
          new URLSearchParams({
            q: query,
            restrict_sr: 'true',
            sort: 'new',
            t: timeRange,
            limit: limit.toString(),
          }).toString();

        const response: RedditSearchResponse = await this.request(endpoint);

        const posts = response.data.children.map((child) =>
          this.transformPost(child.data)
        );

        allPosts.push(...posts);

        console.log(
          `[RedditClient] Found ${posts.length} posts in r/${subreddit}`
        );
      } catch (error) {
        console.error(`[RedditClient] Error searching r/${subreddit}:`, error);
        // Continue with other subreddits even if one fails
      }
    }

    return allPosts;
  }

  /**
   * Get recent posts from a subreddit.
   *
   * @param subreddit - Subreddit to fetch from
   * @param limit - Maximum number of posts
   * @returns Array of recent posts
   */
  async getRecent(subreddit: string, limit = 25): Promise<RedditPost[]> {
    const endpoint = `/r/${subreddit}/new.json?limit=${limit}`;

    const response: RedditSearchResponse = await this.request(endpoint);

    return response.data.children.map((child) =>
      this.transformPost(child.data)
    );
  }

  /**
   * Transform Reddit API response to our internal format.
   *
   * This extracts only the PUBLIC data we need.
   */
  private transformPost(data: RedditSearchResponse['data']['children'][0]['data']): RedditPost {
    return {
      id: data.id,
      subreddit: data.subreddit,
      title: data.title,
      content: data.selftext || '',
      author: data.author,
      url: `https://reddit.com${data.permalink}`,
      createdUtc: data.created_utc,
      score: data.score,
      numComments: data.num_comments,
    };
  }

  /**
   * Get rate limiter status for monitoring.
   */
  getRateLimitStatus(): { tokens: number; requestsPerMinute: number } {
    return this.rateLimiter.getStatus();
  }
}

/**
 * Create a configured Reddit client from environment variables.
 */
export function createRedditClient(): RedditClient {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent =
    process.env.REDDIT_USER_AGENT ||
    'LeadOwl/1.0.0 (https://leadowl.techyowls.io)';

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET environment variables'
    );
  }

  return new RedditClient({
    clientId,
    clientSecret,
    userAgent,
  });
}
