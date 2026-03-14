/**
 * 🧠 Smart Memory System - Main Entry
 * 
 * 4-Layer Memory Architecture:
 * 1. Working Memory - Current context (in-memory)
 * 2. Episodic Memory - Timeline events
 * 3. Semantic Memory - Facts & Knowledge Graph
 * 4. Procedural Memory - Success patterns
 */

import { vectorStore, MemoryEntry, SearchResult } from './vector-store';
import { graphStore, Entity, Relation } from './graph-store';

// Working Memory (in-memory buffer)
const workingMemory: {
  currentTask?: string;
  pendingActions: string[];
  context: Record<string, any>;
} = {
  pendingActions: [],
  context: {}
};

/**
 * Initialize the memory system
 */
export async function initMemory(): Promise<void> {
  await vectorStore.init();
  await graphStore.init();
  console.log('🧠 Smart Memory System Ready');
}

/**
 * Save a fact to semantic memory
 */
export async function saveKeyFact(fact: string, category: string): Promise<string> {
  // Save to vector store
  const id = await vectorStore.insert(fact, {
    type: 'semantic',
    tags: [category],
    metadata: { category }
  });
  
  // Also add to graph
  const entityName = extractEntityName(fact);
  if (entityName) {
    const existing = await graphStore.findEntity(entityName);
    if (existing) {
      await graphStore.updateEntity(existing.id, {
        facts: [...existing.facts, fact]
      });
    } else {
      await graphStore.addEntity(entityName, [fact], category);
    }
  }
  
  return id;
}

/**
 * Extract entity name from fact (simple heuristic)
 */
function extractEntityName(fact: string): string | null {
  // Simple patterns like "X is Y", "X likes Y", "X uses Y"
  const patterns = [
    /^(.+?) (is|was|likes|prefers|uses|has) /i,
    /^(.+?) -> /
  ];
  
  for (const pattern of patterns) {
    const match = fact.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Record an episodic event
 */
export async function recordEvent(
  event: string, 
  userIntent?: string,
  outcome?: string
): Promise<string> {
  const content = [
    userIntent ? `Intent: ${userIntent}`,
    event,
    outcome ? `Outcome: ${outcome}`
  ].filter(Boolean).join(' | ');
  
  return await vectorStore.insert(content, {
    type: 'episodic',
    tags: ['event'],
    metadata: { userIntent, outcome }
  });
}

/**
 * Save a successful procedure
 */
export async function saveProcedure(
  name: string, 
  steps: string[],
  scenario: string
): Promise<string> {
  const content = `# ${name}\n\nScenario: ${scenario}\n\nSteps:\n${steps.map((s, i) => `${i+1}. ${s}`).join('\n')}`;
  
  const id = await vectorStore.insert(content, {
    type: 'procedural',
    tags: [name.toLowerCase().replace(/\s+/g, '-'), 'success-pattern']
  });
  
  // Also add relation to graph
  await graphStore.addRelation('Procedural Memory', 'contains', name);
  
  return id;
}

/**
 * Search across all memory layers
 */
export async function searchMemory(
  query: string, 
  timeRange?: 'today' | 'week' | 'month' | 'all',
  limit = 5
): Promise<{
  episodic: SearchResult[];
  semantic: SearchResult[];
  procedural: SearchResult[];
  graph: { entity: Entity; relation: string }[];
}> {
  const [episodic, semantic, procedural] = await Promise.all([
    vectorStore.search(query, timeRange, limit),
    vectorStore.search(query, timeRange, limit),
    vectorStore.search(query, timeRange, limit)
  ]);
  
  // Also search graph
  const graphResults = await graphStore.getRelatedEntities(query);
  
  return { episodic, semantic, procedural, graph: graphResults };
}

/**
 * Set working memory (current context)
 */
export function setWorkingMemory(key: string, value: any): void {
  workingMemory.context[key] = value;
}

/**
 * Get working memory
 */
export function getWorkingMemory(key: string): any {
  return workingMemory.context[key];
}

/**
 * Add pending action
 */
export function addPendingAction(action: string): void {
  workingMemory.pendingActions.push(action);
}

/**
 * Get and clear pending actions
 */
export function getPendingActions(): string[] {
  const actions = [...workingMemory.pendingActions];
  workingMemory.pendingActions = [];
  return actions;
}

/**
 * Get memory stats
 */
export async function getMemoryStats(): Promise<{
  vector: { total: number; byType: Record<string, number> };
  graph: { entities: number; relations: number };
  working: { pendingActions: number; contextKeys: number };
}> {
  const [vectorStats, graphStats] = await Promise.all([
    vectorStore.getStats(),
    graphStore.getStats()
  ]);
  
  return {
    vector: vectorStats,
    graph: { entities: graphStats.entities, relations: graphStats.relations },
    working: { 
      pendingActions: workingMemory.pendingActions.length,
      contextKeys: Object.keys(workingMemory.context).length
    }
  };
}

/**
 * Add relation to knowledge graph
 */
export async function addRelation(
  from: string, 
  relation: string, 
  to: string
): Promise<void> {
  // Ensure entities exist
  const fromEntity = await graphStore.findEntity(from);
  if (!fromEntity) {
    await graphStore.addEntity(from, [], 'system');
  }
  
  const toEntity = await graphStore.findEntity(to);
  if (!toEntity) {
    await graphStore.addEntity(to, [], 'system');
  }
  
  await graphStore.addRelation(from, relation, to);
}

// Auto-initialize on import
initMemory().catch(console.error);
