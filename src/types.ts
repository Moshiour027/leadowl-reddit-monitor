/**
 * Type Definitions for LeadOwl Reddit Monitor
 *
 * This file defines exactly what data we collect from Reddit.
 * We only collect PUBLIC post data - no private information.
 */

/**
 * Data we collect from a Reddit post.
 *
 * IMPORTANT: All fields are from PUBLIC posts only.
 * We do NOT collect:
 * - Private messages
 * - User emails or personal info
 * - Voting patterns
 * - Browsing history
 */
export interface RedditPost {
  /** Reddit's unique post identifier (e.g., "abc123") */
  id: string;

  /** Subreddit name without r/ prefix (e.g., "webdev") */
  subreddit: string;

  /** Post title - public text */
  title: string;

  /** Post body content - public text */
  content: string;

  /** Reddit username of author - public info */
  author: string;

  /** Full URL to the post on Reddit */
  url: string;

  /** When the post was created on Reddit */
  createdUtc: number;

  /** Post score (upvotes - downvotes) - public info */
  score: number;

  /** Number of comments - public info */
  numComments: number;
}

/**
 * What we store in our database.
 *
 * This is a subset of RedditPost with additional metadata
 * for our internal processing.
 */
export interface StoredLead {
  /** Our internal ID */
  id: string;

  /** Source platform (always "reddit" for this integration) */
  source: 'reddit';

  /** Reddit post ID */
  sourceId: string;

  /** Full Reddit URL */
  sourceUrl: string;

  /** Post title */
  title: string;

  /** Post content */
  content: string;

  /** Reddit username */
  author: string;

  /** Link to author's Reddit profile */
  authorUrl: string;

  /** Which keywords matched this post */
  matchedKeywords: string[];

  /** When we collected this post */
  collectedAt: Date;

  /** When post was created on Reddit */
  sourceCreatedAt: Date;
}

/**
 * Search query configuration.
 */
export interface SearchQuery {
  /** Keywords to search for */
  keywords: string[];

  /** Subreddits to search in */
  subreddits: string[];

  /** Time range (hour, day, week, month) */
  timeRange: 'hour' | 'day' | 'week' | 'month';

  /** Maximum results per query */
  limit: number;
}

/**
 * Rate limiter configuration.
 *
 * We use CONSERVATIVE limits - well below Reddit's allowances.
 */
export interface RateLimitConfig {
  /** Requests per minute (Reddit allows 60, we use 30) */
  requestsPerMinute: number;

  /** Maximum burst of requests */
  burstLimit: number;

  /** Multiplier for exponential backoff */
  backoffMultiplier: number;

  /** Maximum backoff time in milliseconds */
  maxBackoffMs: number;

  /** Maximum retry attempts */
  maxRetries: number;
}

/**
 * Reddit API response for search.
 */
export interface RedditSearchResponse {
  data: {
    children: Array<{
      data: {
        id: string;
        subreddit: string;
        title: string;
        selftext: string;
        author: string;
        permalink: string;
        created_utc: number;
        score: number;
        num_comments: number;
      };
    }>;
    after: string | null;
  };
}

/**
 * OAuth token response from Reddit.
 */
export interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
