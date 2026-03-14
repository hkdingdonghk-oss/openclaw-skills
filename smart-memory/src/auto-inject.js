/**
 * Memory Auto-Inject Integration
 * 
 * This module provides automatic memory injection for conversations
 * Call checkAndInject() before responding to include relevant memories
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

// Key phrases that should trigger memory search
const TRIGGERS = [
  '記得', '之前', '上次', '幾時', '點整', '點解',
  'remember', 'before', 'how to', 'what was',
  '用戶', '業', 'comfyui', 'evomap', 'github',
  'setup', '整', '做', '點樣', '有咩'
];

export function shouldSearchMemory(message) {
  const lower = message.toLowerCase();
  return TRIGGERS.some(t => lower.includes(t.toLowerCase()));
}

export function searchMemoryForContext(query, maxResults = 3) {
  const entries = loadMemory();
  if (entries.length === 0) return null;
  
  const queryLower = query.toLowerCase();
  const now = Date.now();
  
  const results = entries
    .map(entry => {
      let score = 0;
      // Content match
      if (entry.content.toLowerCase().includes(queryLower)) score += 15;
      // Tag match
      entry.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) score += 10;
      });
      // Recency boost (last 7 days)
      const daysOld = (now - entry.timestamp) / (24 * 60 * 60 * 1000);
      if (daysOld < 7) score += 5;
      else if (daysOld < 30) score += 2;
      
      return { entry, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
  
  if (results.length === 0) return null;
  
  return results.map(r => {
    const date = new Date(r.entry.timestamp).toLocaleDateString('zh-HK');
    const type = r.entry.type === 'semantic' ? '📝' : r.entry.type === 'episodic' ? '📅' : '⚙️';
    return `${type} [${date}] ${r.entry.content.substring(0, 120)}...`;
  }).join('\n\n');
}

export function checkAndInject(userMessage) {
  // Only search if contains trigger words
  if (!shouldSearchMemory(userMessage)) {
    return null;
  }
  
  const context = searchMemoryForContext(userMessage, 2);
  if (!context) return null;
  
  return `\n📚 **相關記憶:**\n${context}`;
}

// Quick functions for direct use
export function getAllMemories() {
  return loadMemory();
}

export function getMemoryStats() {
  const entries = loadMemory();
  const byType = { semantic: 0, episodic: 0, procedural: 0 };
  entries.forEach(e => byType[e.type] = (byType[e.type] || 0) + 1);
  return { total: entries.length, byType };
}
