// DeepEconomy - Boot Screen & Main Entry
const express = require('express');
const open = require('open');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Boot animation
async function boot() {
  console.clear();
  
  // Matrix-style lines
  for (let i = 0; i < 15; i++) {
    const line = '█'.repeat(Math.floor(Math.random() * 60) + 20);
    const color = i % 2 === 0 ? chalk.green : chalk.blue;
    console.log(color(line));
    await sleep(50);
  }
  
  console.log('\n');
  console.log(chalk.cyan('╔══════════════════════════════════════════╗'));
  console.log(chalk.cyan('║     DeepEconomy - LLM Economy IA         ║'));
  console.log(chalk.cyan('╚══════════════════════════════════════════╝'));
  console.log('\n');
  
  console.log(chalk.white('Version: 1.0.0'));
  console.log(chalk.white('Author: hkkh-code'));
  console.log(chalk.white('GitHub: https://github.com/hkkh-code/LLM-Economy-IA'));
  console.log('\n');
  
  console.log(chalk.yellow('Bienvenue sur DeepEconomy (LLM Economy IA)!'));
  console.log(chalk.yellow('Avant tout message avec les IA, je vous invite à voir le dashboard'));
  console.log(chalk.yellow('et suivre le tuto YouTube sur la chaîne:'));
  console.log(chalk.red('👉 https://www.youtube.com/@hkkh-code/'));
  console.log(chalk.red('👇 Allez vous abonner svp 🙏🥀'));
  console.log('\n');
  
  console.log(chalk.white('En utilisant les modèles, vous acceptez leurs termes et conditions.'));
  console.log(chalk.white('DeepSeek, Groq, Google AI, Cohere, Anthropic, Mistral, Together AI'));
  console.log('\n');
  
  console.log(chalk.green('✓ Démarrage du dashboard...'));
  console.log(chalk.green(`✓ Dashboard disponible sur: http://localhost:${PORT}`));
  console.log(chalk.green('✓ Ouverture automatique dans votre navigateur...'));
  console.log('\n');
  
  // Start server
  startServer();
  
  // Open browser
  setTimeout(() => {
    open(`http://localhost:${PORT}`);
  }, 1000);
}

function startServer() {
  // Serve static files
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(express.json());
  
  // API: Get providers
  app.get('/api/providers', (req, res) => {
    res.json(getProviders());
  });
  
  // API: Add API key
  app.post('/api/keys', (req, res) => {
    const { provider, key } = req.body;
    // Store key (in real app, use secure storage)
    res.json({ success: true });
  });
  
  // API: Chat with AI
  app.post('/api/chat', async (req, res) => {
    const { message, provider } = req.body;
    
    // Mock response (in real app, call actual API)
    const response = {
      message: `[DeepEconomy] Response from ${provider || 'auto'}: ${message}`,
      tokens: { input: 10, output: 20, total: 30 },
      provider: provider || 'deepseek',
      model: 'deepseek-chat'
    };
    
    res.json(response);
  });
  
  // API: Stats
  app.get('/api/stats', (req, res) => {
    res.json({
      tokens: { used: 150, saved: 45 },
      requests: 3,
      savings: 23
    });
  });
  
  app.listen(PORT, () => {
    console.log(chalk.green(`✓ Serveur démarré sur le port ${PORT}`));
  });
}

function getProviders() {
  return [
    { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'], free: true },
    { id: 'groq', name: 'Groq', models: ['llama-3.3-70b', 'mixtral-8x7b'], free: true },
    { id: 'google', name: 'Google AI', models: ['gemini-1.5-flash', 'gemini-1.5-pro'], free: true },
    { id: 'cohere', name: 'Cohere', models: ['command'], free: true },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3-haiku'], free: true },
    { id: 'mistral', name: 'Mistral', models: ['mistral-tiny', 'codestral'], free: true },
    { id: 'together', name: 'Together AI', models: ['llama-3-8b', 'mixtral-8x7b'], free: true }
  ];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run boot
boot();
