import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.NEYNAR_API_KEY;

if (!apiKey) {
  console.error('Please provide NEYNAR_API_KEY in .env');
  process.exit(1);
}

const client = new NeynarAPIClient({ apiKey });

async function createSigner() {
  try {
    const signer = await client.createSigner();
    console.log('--- NEW SIGNER CREATED ---');
    console.log('UUID:', signer.signer_uuid);
    console.log('Public Key:', signer.public_key);
    console.log('Status:', signer.status);
    console.log('\n--- STEPS TO APPROVE ---');
    console.log('1. Open this URL in your browser/phone:');
    console.log(signer.signer_approval_url);
    console.log('\n2. Approve the request in your Warpcast app.');
    console.log('3. Once approved, copy the UUID to your .env file as NEYNAR_SIGNER_UUID.');
  } catch (error) {
    console.error('Error creating signer:', error);
  }
}

createSigner();
