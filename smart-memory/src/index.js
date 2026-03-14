/**
 * 🧠 Smart Memory System - JavaScript Version
 * 
 * Direct import without TypeScript compilation
 * 
 * Functions:
 * - initMemory() - Initialize memory system
 * - saveKeyFact(fact, category) - Save to semantic memory
 * - recordEvent(event, userIntent, outcome) - Record episodic
 * - saveProcedure(name, steps, scenario) - Save success pattern
 * - searchMemory(query, timeRange, limit) - Search all layers
 * - getMemoryStats() - Get memory statistics
 * - addRelation(from, relation, to) - Add knowledge graph relation
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';

const MEMORY_DIR = join(process.cwd(), 'memory');
const DB_FILE = join(MEMORY_DIR, '.db.json');
const GRAPH_DIR = join(MEMORY_DIR, 'graph');

// Ensure directories exist
function ensureDirs() {
  if (!existsSync(MEMORY_DIR)) mkdirSync(MEMORY_DIR, { recursive: true });
  if (!existsSync(GRAPH_DIR)) mkdirSync(GRAPH_DIR, { recursive: true });
}

// Load or create database
function loadDB() {
  ensureDirs();
  if (existsSync(DB_FILE)) {
    try {
      return JSON.parse(readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      return { entries: [], entities: [], relations: [] };
    }
  }
  return { entries: [], entities: [], relations: [] };
}

function saveDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============ Vector Store Functions ============

export async function saveKeyFact(fact, category = 'general') {
  const db = loadDB();
  const id = generateId();
  
  db.entries.push({
    id,
    content: fact,
    type: 'semantic',
    timestamp: Date.now(),
    tags: [category],
    metadata: { category }
  });
  
  // Add to entities
  const entityName = extractEntityName(fact);
  if (entityName) {
    let entity = db.entities.find(e => e.name.toLowerCase() === entityName.toLowerCase());
    if (entity) {
      entity.facts.push(fact);
      entity.updatedAt = Date.now();
    } else {
      db.entities.push({
        id: generateId(),
        name: entityName,
        facts: [fact],
        category,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }
  
  saveDB(db);
  return id;
}

function extractEntityName(fact) {
  const patterns = [/^(.+?) (is|was|likes|prefers|uses|has) /i, /^(.+?) -> /];
  for (const pattern of patterns) {
    const match = fact.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return null;
}

export async function recordEvent(event, userIntent, outcome) {
  const db = loadDB();
  const parts = [];
  if (userIntent) parts.push('Intent: ' + userIntent);
  parts.push(event);
  if (outcome) parts.push('Outcome: ' + outcome);
  const content = parts.filter(Boolean).join(' | ');
  
  const id = generateId();
  db.entries.push({
    id,
    content,
    type: 'episodic',
    timestamp: Date.now(),
    tags: ['event'],
    metadata: { userIntent, outcome }
  });
  
  saveDB(db);
  return id;
}

export async function saveProcedure(name, steps, scenario) {
  const db = loadDB();
  const content = `# ${name}\n\nScenario: ${scenario}\n\nSteps:\n${steps.map((s, i) => `${i+1}. ${s}`).join('\n')}`;
  
  const id = generateId();
  db.entries.push({
    id,
    content,
    type: 'procedural',
    timestamp: Date.now(),
    tags: [name.toLowerCase().replace(/\s+/g, '-'), 'success-pattern']
  });
  
  // Add relation
  db.relations.push({ from: 'Procedural Memory', relation: 'contains', to: name });
  
  saveDB(db);
  return id;
}

export async function searchMemory(query, timeRange = 'all', limit = 5) {
  const db = loadDB();
  const queryLower = query.toLowerCase();
  const now = Date.now();
  
  // Filter by time
  let entries = db.entries;
  if (timeRange === 'today') {
    const todayStart = new Date().setHours(0, 0, 0, 0);
    entries = entries.filter(e => e.timestamp >= todayStart);
  } else if (timeRange === 'week') {
    entries = entries.filter(e => e.timestamp >= now - 7 * 24 * 60 * 60 * 1000);
  } else if (timeRange === 'month') {
    entries = entries.filter(e => e.timestamp >= now - 30 * 24 * 60 * 60 * 1000);
  }
  
  // Score and sort
  const results = entries
    .map(entry => {
      let score = 0;
      if (entry.content.toLowerCase().includes(queryLower)) score += 10;
      entry.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) score += 5;
      });
      const daysOld = (now - entry.timestamp) / (24 * 60 * 60 * 1000);
      score += Math.max(0, 5 - daysOld);
      return { entry, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Graph search
  const graphResults = db.entities.filter(e => 
    e.name.toLowerCase().includes(queryLower) ||
    e.facts.some(f => f.toLowerCase().includes(queryLower))
  );
  
  return {
    episodic: results.filter(r => r.entry.type === 'episodic'),
    semantic: results.filter(r => r.entry.type === 'semantic'),
    procedural: results.filter(r => r.entry.type === 'procedural'),
    graph: graphResults.map(e => ({ entity: e, relation: 'contains' }))
  };
}

export async function addRelation(from, relation, to) {
  const db = loadDB();
  
  // Ensure entities exist
  if (!db.entities.find(e => e.name.toLowerCase() === from.toLowerCase())) {
    db.entities.push({
      id: generateId(),
      name: from,
      facts: [],
      category: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
  if (!db.entities.find(e => e.name.toLowerCase() === to.toLowerCase())) {
    db.entities.push({
      id: generateId(),
      name: to,
      facts: [],
      category: 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
  
  db.relations.push({ from, relation, to });
  saveDB(db);
}

export async function getMemoryStats() {
  const db = loadDB();
  const byType = { episodic: 0, semantic: 0, procedural: 0 };
  db.entries.forEach(e => byType[e.type] = (byType[e.type] || 0) + 1);
  
  return {
    vector: { total: db.entries.length, byType },
    graph: { entities: db.entities.length, relations: db.relations.length },
    working: { pendingActions: 0, contextKeys: 0 }
  };
}

export async function initMemory() {
  ensureDirs();
  console.log('🧠 Smart Memory System Ready');
}

// Auto-init
initMemory().catch(console.error);
