import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.NEYNAR_API_KEY;
const developerMnemonic = process.env.FARCASTER_DEVELOPER_MNEMONIC;

if (!apiKey) {
  console.error('Please provide NEYNAR_API_KEY in .env');
  process.exit(1);
}

const client = new NeynarAPIClient({ apiKey });

async function createSigner() {
  try {
    const signer = developerMnemonic
      ? await client.createSignerAndRegisterSignedKey({
          farcasterDeveloperMnemonic: developerMnemonic,
          deadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
        })
      : await client.createSigner();

    if (!signer) {
      console.error('Signer generation returned no result.');
      process.exit(1);
    }

    console.log('--- NEW SIGNER CREATED ---');
    console.log('UUID:', signer.signer_uuid);
    console.log('Public Key:', signer.public_key);
    console.log('Status:', signer.status);

    if (signer.signer_approval_url) {
      console.log('\n--- STEPS TO APPROVE ---');
      console.log('1. Open this URL in your browser/phone:');
      console.log(signer.signer_approval_url);
      console.log('\n2. Approve the request in your Warpcast app.');
      console.log('3. Use this UUID as NEYNAR_SIGNER_UUID after approval.');
      return;
    }

    console.log('\n--- NEXT STEP REQUIRED ---');
    console.log('This signer is only generated, not registered for approval yet.');
    console.log('Add FARCASTER_DEVELOPER_MNEMONIC to your env and run this script again.');
    console.log('That lets Neynar register the signed key and return signer_approval_url.');
  } catch (error) {
    console.error('Error creating signer:', error);
  }
}

createSigner();
