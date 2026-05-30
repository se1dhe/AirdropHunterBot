import dotenv from 'dotenv';
import { monitorFarcaster } from './neynar.js';
import { sendNotification } from './telegram.js';

dotenv.config();

const main = async () => {
  console.log('🚀 Starting Drop Bot in alert-only mode...');
  
  try {
    await sendNotification('🚀 *Drop Bot Started*\nAlert-only mode is enabled.\nMonitoring Farcaster for drops...');
    
    // Start Farcaster monitoring
    monitorFarcaster();
    
    // TODO: Implement Twitter monitoring if needed
    // monitorTwitter();
    
    console.log('Bot is running in alert-only mode. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('Fatal error starting bot:', error);
    process.exit(1);
  }
};

main();
