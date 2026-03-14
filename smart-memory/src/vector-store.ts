/**
 * 📦 Vector Store - File-based semantic search
 * 
 * Uses simple text matching + date indexing
 * Can be upgraded to use sqlite-vss for vector embeddings
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export interface MemoryEntry {
  id: string;
  content: string;
  type: 'episodic' | 'semantic' | 'procedural';
  timestamp: number;
  tags: string[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  entry: MemoryEntry;
  score: number;
}

const DB_PATH = join(process.cwd(), 'memory', '.db.json');

class VectorStore {
  private entries: MemoryEntry[] = [];
  private initialized = false;

  async init(dbPath?: string): Promise<void> {
    if (this.initialized) return;
    
    const path = dbPath || DB_PATH;
    const dir = join(path, '..');
    
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
    if (existsSync(path)) {
      try {
        const data = readFileSync(path, 'utf8');
        this.entries = JSON.parse(data);
      } catch (e) {
        this.entries = [];
      }
    }
    
    this.initialized = true;
    console.log('📦 VectorStore initialized with', this.entries.length, 'entries');
  }

  private save(): void {
    writeFileSync(DB_PATH, JSON.stringify(this.entries, null, 2));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async insert(content: string, options: {
    type: 'episodic' | 'semantic' | 'procedural';
    tags?: string[];
    metadata?: Record<string, any>;
  }): Promise<string> {
    const entry: MemoryEntry = {
      id: this.generateId(),
      content,
      type: options.type,
      timestamp: Date.now(),
      tags: options.tags || [],
      metadata: options.metadata
    };
    
    this.entries.push(entry);
    this.save();
    
    return entry.id;
  }

  async search(query: string, timeRange?: string, limit = 5): Promise<SearchResult[]> {
    const queryLower = query.toLowerCase();
    const now = Date.now();
    
    // Filter by time range
    let filtered = this.entries;
    
    if (timeRange === 'today') {
      const todayStart = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter(e => e.timestamp >= todayStart);
    } else if (timeRange === 'week') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(e => e.timestamp >= weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(e => e.timestamp >= monthAgo);
    }
    
    // Score by keyword matching
    const results = filtered.map(entry => {
      let score = 0;
      
      // Exact match
      if (entry.content.toLowerCase().includes(queryLower)) {
        score += 10;
      }
      
      // Tag match
      entry.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          score += 5;
        }
      });
      
      // Recency boost
      const age = now - entry.timestamp;
      const daysOld = age / (24 * 60 * 60 * 1000);
      score += Math.max(0, 5 - daysOld); // Recent entries get boost
      
      return { entry, score };
    });
    
    // Sort by score and return top results
    return results
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getByType(type: 'episodic' | 'semantic' | 'procedural'): Promise<MemoryEntry[]> {
    return this.entries.filter(e => e.type === type);
  }

  async delete(id: string): Promise<boolean> {
    const index = this.entries.findIndex(e => e.id === id);
    if (index >= 0) {
      this.entries.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  async getStats(): Promise<{ total: number; byType: Record<string, number> }> {
    const byType: Record<string, number> = {
      episodic: 0,
      semantic: 0,
      procedural: 0
    };
    
    this.entries.forEach(e => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });
    
    return { total: this.entries.length, byType };
  }
}

export const vectorStore = new VectorStore();
