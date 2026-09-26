// key-rotation.ts
// Shows how API key rotation and scoring works

import { ApiKeyManager, RateLimitManager } from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  const keyManager = new ApiKeyManager(true, 5);
  const rateLimitManager = new RateLimitManager(60000);

  // Add your API keys
  // The priority number determines which key to try first (lower = higher priority)
  console.log('Registering keys...\n');
  
  keyManager.registerKey('sk-primary-1', 1);
  keyManager.registerKey('sk-primary-2', 1);
  keyManager.registerKey('sk-secondary', 2);
  keyManager.registerKey('sk-backup', 3);

  console.log('Simulating some requests...\n');

  for (let i = 1; i <= 10; i++) {
    const keyId = keyManager.selectKey();
    
    if (!keyId) {
      console.log(`Request ${i}: No keys available`);
      continue;
    }

    if (!rateLimitManager.canProceed(keyId)) {
      console.log(`Request ${i}: Key ${keyId} in cooldown`);
      continue;
    }

    const stats = keyManager.getKeyStats(keyId);
    console.log(`Request ${i}: Using ${keyId} (score: ${stats.score})`);

    // Simulate different outcomes
    if (i === 3) {
      console.log(`  Rate limited!`);
      keyManager.updateKeyStatus(keyId, 'rateLimited');
      rateLimitManager.recordRateLimit(keyId, 60);
    } else if (i === 5) {
      console.log(`  Failed`);
      keyManager.updateKeyStatus(keyId, 'failure');
    } else {
      console.log(`  Success`);
      keyManager.updateKeyStatus(keyId, 'success');
    }
  }

  // Show final stats
  console.log('\nFinal key stats:\n');
  const allStats = keyManager.getAllStats();
  allStats.forEach(stat => {
    console.log(`${stat.id}: score=${stat.score}, requests=${stat.requests}, status=${stat.status}`);
  });
}

main().catch(console.error);
