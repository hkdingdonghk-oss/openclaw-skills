/**
 * 🕸️ Graph Store - Knowledge Graph
 * 
 * Manages entities and their relationships
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface Entity {
  id: string;
  name: string;
  facts: string[];
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface Relation {
  from: string;
  relation: string;
  to: string;
}

const GRAPH_DIR = join(process.cwd(), 'memory', 'graph');
const ENTITIES_FILE = join(GRAPH_DIR, '.entities.json');
const RELATIONS_FILE = join(GRAPH_DIR, '.relations.json');

class GraphStore {
  private entities: Map<string, Entity> = new Map();
  private relations: Relation[] = [];
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    if (!existsSync(GRAPH_DIR)) {
      mkdirSync(GRAPH_DIR, { recursive: true });
    }
    
    // Load entities
    if (existsSync(ENTITIES_FILE)) {
      try {
        const data = readFileSync(ENTITIES_FILE, 'utf8');
        const entitiesArray: Entity[] = JSON.parse(data);
        entitiesArray.forEach(e => this.entities.set(e.id, e));
      } catch (e) {
        console.error('Failed to load entities:', e);
      }
    }
    
    // Load relations
    if (existsSync(RELATIONS_FILE)) {
      try {
        const data = readFileSync(RELATIONS_FILE, 'utf8');
        this.relations = JSON.parse(data);
      } catch (e) {
        console.error('Failed to load relations:', e);
      }
    }
    
    this.initialized = true;
    console.log('🕸️ GraphStore initialized:', this.entities.size, 'entities,', this.relations.length, 'relations');
  }

  private saveEntities(): void {
    writeFileSync(ENTITIES_FILE, JSON.stringify(Array.from(this.entities.values()), null, 2));
  }

  private saveRelations(): void {
    writeFileSync(RELATIONS_FILE, JSON.stringify(this.relations, null, 2));
  }

  private generateId(): string {
    return `entity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async addEntity(name: string, facts: string[], category = 'general'): Promise<string> {
    const id = this.generateId();
    const entity: Entity = {
      id,
      name,
      facts,
      category,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.entities.set(id, entity);
    this.saveEntities();
    
    return id;
  }

  async addRelation(from: string, relation: string, to: string): Promise<void> {
    this.relations.push({ from, relation, to });
    this.saveRelations();
  }

  async findEntity(name: string): Promise<Entity | undefined> {
    for (const entity of this.entities.values()) {
      if (entity.name.toLowerCase() === name.toLowerCase()) {
        return entity;
      }
    }
    return undefined;
  }

  async findEntitiesByCategory(category: string): Promise<Entity[]> {
    return Array.from(this.entities.values()).filter(e => 
      e.category.toLowerCase() === category.toLowerCase()
    );
  }

  async queryRelations(entityName: string): Promise<Relation[]> {
    return this.relations.filter(r => 
      r.from.toLowerCase().includes(entityName.toLowerCase()) ||
      r.to.toLowerCase().includes(entityName.toLowerCase())
    );
  }

  async getRelatedEntities(entityName: string): Promise<{ entity: Entity; relation: string }[]> {
    const results: { entity: Entity; relation: string }[] = [];
    
    for (const rel of this.relations) {
      if (rel.from.toLowerCase().includes(entityName.toLowerCase())) {
        const target = Array.from(this.entities.values()).find(e => 
          e.name.toLowerCase() === rel.to.toLowerCase()
        );
        if (target) {
          results.push({ entity: target, relation: rel.relation });
        }
      }
    }
    
    return results;
  }

  async updateEntity(id: string, updates: Partial<Entity>): Promise<boolean> {
    const entity = this.entities.get(id);
    if (!entity) return false;
    
    Object.assign(entity, updates, { updatedAt: Date.now() });
    this.entities.set(id, entity);
    this.saveEntities();
    
    return true;
  }

  async getStats(): Promise<{ entities: number; relations: number; categories: string[] }> {
    const categories = new Set(Array.from(this.entities.values()).map(e => e.category));
    return {
      entities: this.entities.size,
      relations: this.relations.length,
      categories: Array.from(categories)
    };
  }
}

export const graphStore = new GraphStore();
