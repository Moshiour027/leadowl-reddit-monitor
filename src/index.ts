/**
 * LeadOwl Reddit Monitor
 *
 * Customer feedback monitoring for indie software developers.
 *
 * This tool helps software developers find and respond to
 * community questions about their products on Reddit.
 *
 * IMPORTANT:
 * - We only READ public posts
 * - We do NOT automate posting or commenting
 * - We respect rate limits (50% of allowed)
 * - We delete data after 90 days
 *
 * @see README.md for full documentation
 * @see docs/ for detailed policies
 */

import { runCollection } from './collector';

async function main() {
  console.log('LeadOwl Reddit Monitor');
  console.log('======================');
  console.log('');
  console.log('Purpose: Find community questions we can help answer');
  console.log('Rate Limit: 30 req/min (50% of allowed 60)');
  console.log('Retention: 90 days');
  console.log('');

  try {
    console.log('Starting collection...');
    const leads = await runCollection();

    console.log('');
    console.log(`Found ${leads.length} relevant posts`);

    for (const lead of leads.slice(0, 5)) {
      console.log('');
      console.log(`[${lead.source}] ${lead.title}`);
      console.log(`  URL: ${lead.sourceUrl}`);
      console.log(`  Keywords: ${lead.matchedKeywords.join(', ')}`);
    }

    if (leads.length > 5) {
      console.log('');
      console.log(`... and ${leads.length - 5} more`);
    }
  } catch (error) {
    console.error('Collection failed:', error);
    process.exit(1);
  }
}

main();
