import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import dotenv from 'dotenv';
import { getEthAddress } from './wallet.js';
import { sendNotification } from './telegram.js';
dotenv.config();
const apiKey = process.env.NEYNAR_API_KEY || '';
const signerUuid = process.env.NEYNAR_SIGNER_UUID || '';
const client = new NeynarAPIClient({ apiKey });
const repliedCasts = new Set();
export const monitorFarcaster = async () => {
    const keywords = (process.env.SEARCH_KEYWORDS || '').split(',');
    const ethAddress = getEthAddress();
    const replyTemplate = process.env.REPLY_MESSAGE || 'Here is my address: {address}';
    console.log(`Starting Farcaster monitoring for keywords: ${keywords.join(', ')}`);
    setInterval(async () => {
        try {
            for (const keyword of keywords) {
                const result = await client.searchCasts({ q: keyword });
                const casts = result.result.casts;
                for (const cast of casts) {
                    if (repliedCasts.has(cast.hash))
                        continue;
                    // Check if it's a recent cast (e.g., last 10 minutes)
                    const castDate = new Date(cast.timestamp);
                    const now = new Date();
                    const diffMinutes = (now.getTime() - castDate.getTime()) / (1000 * 60);
                    if (diffMinutes < 10 && shouldReply(cast)) {
                        await replyToCast(cast, ethAddress, replyTemplate);
                    }
                    repliedCasts.add(cast.hash);
                }
            }
        }
        catch (error) {
            console.error('Error monitoring Farcaster:', error);
        }
    }, 60000); // Check every minute
};
const shouldReply = (cast) => {
    const text = cast.text.toLowerCase();
    // Simple heuristic: check if it looks like a "drop your address" post
    return text.includes('drop') || text.includes('wallet') || text.includes('address');
};
const replyToCast = async (cast, address, template) => {
    if (!signerUuid) {
        console.log('No signer UUID, skipping reply to:', cast.hash);
        return;
    }
    const replyText = template.replace('{address}', address);
    try {
        await client.publishCast({
            signerUuid,
            text: replyText,
            parent: cast.hash
        });
        console.log(`Replied to cast ${cast.hash} by @${cast.author.username}`);
        await sendNotification(`✅ *Replied to Drop*\n` +
            `👤 User: @${cast.author.username}\n` +
            `📝 Cast: ${cast.text.substring(0, 50)}...\n` +
            `🔗 [View Cast](https://warpcast.com/${cast.author.username}/${cast.hash.substring(0, 10)})`);
    }
    catch (error) {
        console.error(`Failed to reply to cast ${cast.hash}:`, error);
    }
};
//# sourceMappingURL=neynar.js.map