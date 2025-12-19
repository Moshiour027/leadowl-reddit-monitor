/**
 * Reddit Post Collector
 *
 * This module collects public Reddit posts that match our product keywords.
 *
 * PURPOSE:
 * - Find posts where users ask about tools we make
 * - Enable our team to provide helpful responses
 * - Monitor feedback about our products
 *
 * WHAT WE DON'T DO:
 * - Automated posting or commenting
 * - Mass data collection
 * - Selling or sharing data
 */

import { RedditClient, createRedditClient } from './reddit-client';
import type { RedditPost, StoredLead } from './types';

/**
 * Subreddits we monitor.
 *
 * These are developer communities where our products are relevant.
 * We intentionally keep this list small and focused.
 */
export const MONITORED_SUBREDDITS = [
  'webdev', // Web development discussions
  'SaaS', // SaaS product discussions
  'startups', // Startup founders
  'node', // Node.js developers
  'reactjs', // React developers
  'selfhosted', // Self-hosted software enthusiasts
  'indiehackers', // Indie makers
  'programming', // General programming
  'macapps', // Mac applications
  'devops', // DevOps engineers
  'typescript', // TypeScript developers
  'javascript', // JavaScript developers
] as const;

/**
 * Keywords we search for.
 *
 * These are related to our products:
 * - SnapForge: Screenshot API
 * - Octa: Mac Calculator
 * - WatchOwl: Visual Monitoring
 * - DocForge: PDF Generation
 */
export const PRODUCT_KEYWORDS = {
  // SnapForge - Screenshot API
  snapforge: [
    'screenshot api',
    'screenshot service',
    'webpage capture',
    'url to image',
    'website screenshot',
    'html to image',
    'puppeteer screenshot',
    'playwright screenshot',
  ],

  // Octa - Mac Calculator
  octa: [
    'mac calculator',
    'calculator app mac',
    'developer calculator',
    'programmer calculator',
    'scientific calculator mac',
    'hex calculator',
    'binary calculator',
  ],

  // WatchOwl - Visual Monitoring
  watchowl: [
    'visual monitoring',
    'website change detection',
    'visual regression',
    'page change alert',
    'website diff',
  ],

  // DocForge - PDF Generation
  docforge: [
    'pdf api',
    'html to pdf',
    'pdf generation',
    'document generation api',
    'invoice pdf api',
  ],
} as const;

/**
 * General intent keywords that indicate someone is looking for a tool.
 */
export const INTENT_KEYWORDS = [
  'looking for',
  'recommend',
  'alternative to',
  'best tool for',
  'anyone know',
  'need a',
  'searching for',
] as const;

/**
 * Collector class for finding relevant Reddit posts.
 */
export class RedditCollector {
  private client: RedditClient;

  constructor(client?: RedditClient) {
    this.client = client || createRedditClient();
  }

  /**
   * Collect posts matching our product keywords.
   *
   * This is the main collection function that:
   * 1. Searches each subreddit for our keywords
   * 2. Filters to posts with genuine intent
   * 3. Returns posts for human review
   *
   * @returns Posts that match our criteria
   */
  async collect(): Promise<StoredLead[]> {
    console.log('[Collector] Starting collection run...');

    const allPosts: RedditPost[] = [];

    // Search for each product's keywords
    for (const [product, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
      for (const keyword of keywords) {
        console.log(`[Collector] Searching for "${keyword}" (${product})`);

        const posts = await this.client.search(
          keyword,
          [...MONITORED_SUBREDDITS],
          { timeRange: 'day', limit: 25 }
        );

        allPosts.push(...posts);
      }
    }

    // Remove duplicates (same post might match multiple keywords)
    const uniquePosts = this.deduplicatePosts(allPosts);

    console.log(
      `[Collector] Found ${uniquePosts.length} unique posts (from ${allPosts.length} total matches)`
    );

    // Transform to our internal format
    const leads = uniquePosts.map((post) => this.transformToLead(post));

    // Filter for genuine intent
    const filteredLeads = leads.filter((lead) =>
      this.hasGenuineIntent(lead)
    );

    console.log(
      `[Collector] ${filteredLeads.length} posts have genuine intent`
    );

    return filteredLeads;
  }

  /**
   * Remove duplicate posts (same Reddit post ID).
   */
  private deduplicatePosts(posts: RedditPost[]): RedditPost[] {
    const seen = new Set<string>();
    return posts.filter((post) => {
      if (seen.has(post.id)) {
        return false;
      }
      seen.add(post.id);
      return true;
    });
  }

  /**
   * Transform Reddit post to our internal lead format.
   */
  private transformToLead(post: RedditPost): StoredLead {
    const matchedKeywords = this.findMatchedKeywords(post);
    const matchedProduct = this.findMatchedProduct(matchedKeywords);

    return {
      id: `reddit_${post.id}`,
      source: 'reddit',
      sourceId: post.id,
      sourceUrl: post.url,
      title: post.title,
      content: post.content,
      author: post.author,
      authorUrl: `https://reddit.com/u/${post.author}`,
      matchedKeywords,
      collectedAt: new Date(),
      sourceCreatedAt: new Date(post.createdUtc * 1000),
    };
  }

  /**
   * Find which of our keywords matched this post.
   */
  private findMatchedKeywords(post: RedditPost): string[] {
    const text = `${post.title} ${post.content}`.toLowerCase();
    const matched: string[] = [];

    for (const keywords of Object.values(PRODUCT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          matched.push(keyword);
        }
      }
    }

    return [...new Set(matched)]; // Remove duplicates
  }

  /**
   * Find which product the keywords match.
   */
  private findMatchedProduct(matchedKeywords: string[]): string | null {
    for (const [product, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (matchedKeywords.includes(keyword)) {
          return product;
        }
      }
    }
    return null;
  }

  /**
   * Check if the post shows genuine intent to find a tool.
   *
   * We filter out:
   * - Posts that are just sharing their own tool
   * - Low-effort posts
   * - Posts that don't seem to be looking for something
   */
  private hasGenuineIntent(lead: StoredLead): boolean {
    const text = `${lead.title} ${lead.content}`.toLowerCase();

    // Check for intent keywords
    const hasIntentKeyword = INTENT_KEYWORDS.some((keyword) =>
      text.includes(keyword)
    );

    // Check for question indicators
    const isQuestion =
      text.includes('?') ||
      text.startsWith('how') ||
      text.startsWith('what') ||
      text.startsWith('which') ||
      text.startsWith('any');

    // Minimum content length (filter out very short posts)
    const hasSubstance = lead.content.length > 50 || lead.title.length > 30;

    return (hasIntentKeyword || isQuestion) && hasSubstance;
  }

  /**
   * Get rate limit status for monitoring.
   */
  getRateLimitStatus(): { tokens: number; requestsPerMinute: number } {
    return this.client.getRateLimitStatus();
  }
}

/**
 * Run a collection cycle.
 *
 * This is the main entry point for scheduled collection.
 */
export async function runCollection(): Promise<StoredLead[]> {
  const collector = new RedditCollector();
  return collector.collect();
}
