/**
 * @file API Key Rotation example
 * Demonstrates automatic API key rotation and scoring
 */

import { ApiKeyManager, RateLimitManager } from '@deepseek-ai/dsh-experimental-ai-gateway';

async function main() {
  const keyManager = new ApiKeyManager(true, 5);
  const rateLimitManager = new RateLimitManager(60000); // 1 min cooldown

  // Register multiple API keys with priorities
  console.log('Registering API keys...\n');
  
  keyManager.registerKey('sk-primary-key-1', 1);    // Highest priority
  keyManager.registerKey('sk-primary-key-2', 1);    // Same priority
  keyManager.registerKey('sk-secondary-key', 2);    // Lower priority
  keyManager.registerKey('sk-backup-key', 3);       // Backup

  // Simulate request handling
  console.log('Simulating requests...\n');

  for (let i = 1; i <= 10; i++) {
    // Select best available key
    const keyId = keyManager.selectKey();
    
    if (!keyId) {
      console.log(`Request ${i}: ✗ No available keys`);
      continue;
    }

    // Check rate limit
    if (!rateLimitManager.canProceed(keyId)) {
      console.log(`Request ${i}: ✗ Key ${keyId} is in cooldown`);
      continue;
    }

    const keyStats = keyManager.getKeyStats(keyId);
    console.log(`Request ${i}: Using key ${keyId} (score: ${keyStats.score}, requests: ${keyStats.requests})`);

    // Simulate different outcomes
    if (i === 3) {
      // Simulate rate limit on request 3
      console.log(`  → Rate limited!`);
      keyManager.updateKeyStatus(keyId, 'rateLimited');
      rateLimitManager.recordRateLimit(keyId, 60);
    } else if (i === 5) {
      // Simulate failure on request 5
      console.log(`  → Failed`);
      keyManager.updateKeyStatus(keyId, 'failure');
    } else {
      // Simulate success
      console.log(`  → Success`);
      keyManager.updateKeyStatus(keyId, 'success');
    }
  }

  // Show final key statistics
  console.log('\n📊 Final Key Statistics:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Key ID           | Score | Requests | Success | Failed | Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const allStats = keyManager.getAllStats();
  allStats.forEach(stat => {
    console.log(
      `${stat.id.padEnd(16)} | ${stat.score.toString().padStart(5)} | ` +
      `${stat.requests.toString().padStart(8)} | ` +
      `${stat.successfulRequests.toString().padStart(7)} | ` +
      `${stat.failedRequests.toString().padStart(6)} | ` +
      `${stat.status}`
    );
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Show rate limit status
  console.log('🔒 Rate Limit Status:\n');
  allStats.forEach(stat => {
    const status = rateLimitManager.getStatus(stat.id);
    if (status.isRateLimited) {
      console.log(`  ${stat.id}: Rate limited for ${Math.ceil((status.remainingMs || 0) / 1000)}s`);
    } else {
      console.log(`  ${stat.id}: Available`);
    }
  });
}

main().catch(console.error);
