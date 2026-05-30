import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import dotenv from 'dotenv';
import { getOptionalEthAddress } from './wallet.js';
import { sendNotification } from './telegram.js';

dotenv.config();

const apiKey = process.env.NEYNAR_API_KEY || '';
const client = new NeynarAPIClient({ apiKey });

const notifiedCasts = new Set<string>();

export const monitorFarcaster = async () => {
  const keywords = (process.env.SEARCH_KEYWORDS || '')
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const ethAddress = getOptionalEthAddress();
  const replyTemplate = process.env.REPLY_MESSAGE || 'Here is my address: {address}';

  console.log(`Starting Farcaster monitoring for keywords: ${keywords.join(', ')}`);

  setInterval(async () => {
    try {
      for (const keyword of keywords) {
        const result = await client.searchCasts({ q: keyword });
        const casts = result.result.casts;

        for (const cast of casts) {
          if (notifiedCasts.has(cast.hash)) continue;

          // Check if it's a recent cast (e.g., last 10 minutes)
          const castDate = new Date(cast.timestamp);
          const now = new Date();
          const diffMinutes = (now.getTime() - castDate.getTime()) / (1000 * 60);

          if (diffMinutes < 10 && shouldNotify(cast)) {
            await notifyAboutCast(cast, ethAddress, replyTemplate);
          }

          notifiedCasts.add(cast.hash);
        }
      }
    } catch (error) {
      console.error('Error monitoring Farcaster:', error);
    }
  }, 60000); // Check every minute
};

const shouldNotify = (cast: any): boolean => {
  const text = cast.text.toLowerCase();
  // Simple heuristic: check if it looks like a "drop your address" post
  return text.includes('drop') || text.includes('wallet') || text.includes('address');
};

const notifyAboutCast = async (cast: any, address: string | null, template: string) => {
  const replyText = address ? template.replace('{address}', address) : null;
  const castPath = cast.hash.startsWith('0x') ? cast.hash.slice(0, 10) : cast.hash.substring(0, 10);

  try {
    console.log(`Found drop cast ${cast.hash} by @${cast.author.username}`);

    let message =
      `🔔 *New Drop Alert*\n` +
      `👤 User: @${cast.author.username}\n` +
      `🔎 Keyword: ${cast.text.substring(0, 80)}\n` +
      `🔗 [View Cast](https://warpcast.com/${cast.author.username}/${castPath})`;

    if (replyText) {
      message += `\n\n💬 Reply Template:\n\`${replyText}\``;
    }

    await sendNotification(message);
  } catch (error) {
    console.error(`Failed to send alert for cast ${cast.hash}:`, error);
  }
};
