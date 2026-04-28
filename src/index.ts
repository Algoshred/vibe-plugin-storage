/**
 * @vibecontrols/vibe-plugin-storage
 *
 * Storage meta plugin. Owns:
 *   - StorageProvider interface (plugin KV store contract)
 *   - AgentDatabase abstract class (45-method storage contract)
 *   - Adapter registry (registerAdapter / getAdapter / listAdapters)
 *   - createAgentDatabase() factory (resolves the concrete adapter at runtime)
 *
 * Concrete storage providers (e.g. @vibecontrols/vibe-plugin-storage-skalex)
 * call `registerAdapter("name", factory)` on import. The agent then calls
 * `createAgentDatabase({ dbPath, encryptionKey })` to get an adapter instance.
 */

export {
  AgentDatabase,
  type AgentStorageAdapterFactory,
  type AgentStorageAdapterOptions,
  type StorageEntry,
  type Task,
  type GitRepository,
  type BookmarkedCommand,
  type Notification,
} from "./types.js";

export { registerAdapter, getAdapter, listAdapters } from "./registry.js";

export {
  createAgentDatabase,
  type AgentDatabaseCreateOptions,
} from "./database.js";

export type { StorageProvider } from "./provider.js";
