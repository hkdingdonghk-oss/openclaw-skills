/**
 * Memory Search Hook - Auto-inject relevant memories before responding
 * 
 * This provides a function to search memory and format results for context
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const MEMORY_DB = join(process.cwd(), 'memory', '.db.json');

function loadMemory() {
  if (existsSync(MEMORY_DB)) {
    try {
      return JSON.parse(readFileSync(MEMORY_DB, 'utf8')).entries || [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

export function searchMemoryForContext(query, maxResults = 3) {
  const entries = loadMemory();
  const queryLower = query.toLowerCase();
  const now = Date.now();
  
  // Score by relevance
  const results = entries
    .map(entry => {
      let score = 0;
      if (entry.content.toLowerCase().includes(queryLower)) score += 10;
      entry.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) score += 5;
      });
      // Recency boost
      const daysOld = (now - entry.timestamp) / (24 * 60 * 60 * 1000);
      score += Math.max(0, 3 - daysOld);
      return { entry, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  
  if (results.length === 0) return null;
  
  return results.map(r => {
    const date = new Date(r.entry.timestamp).toLocaleDateString('zh-HK');
    return `[${date}] ${r.entry.content.substring(0, 150)}`;
  }).join('\n');
}

// Auto-run: Check for relevant memory on key phrases
export function checkAndInjectContext(userMessage) {
  const triggers = [
    '記得', '之前', '上次', '幾時', '點整', '點解',
    'remember', 'before', 'how to', 'what was',
    '用戶', 'comfyui', 'evomap', '業'
  ];
  
  const shouldSearch = triggers.some(t => 
    userMessage.toLowerCase().includes(t.toLowerCase())
  );
  
  if (shouldSearch) {
    return searchMemoryForContext(userMessage, 2);
  }
  return null;
}
