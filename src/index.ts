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
 *
 * The default Skalex adapter is auto-registered as a side effect of
 * importing this package, so the agent never has to depend on the
 * skalex package directly. Override at runtime via VIBE_STORAGE_ADAPTER
 * or pass `adapterFactory` to `createAgentDatabase()`.
 */

import { createSkalexAgentDatabase } from "@vibecontrols/vibe-plugin-storage-skalex";
import { registerAdapter as registerAdapterImpl } from "./registry.js";

// Auto-register the bundled Skalex adapter.
registerAdapterImpl("skalex", createSkalexAgentDatabase);

/**
 * Minimal facade of the agent's ProfileContext. The plugin has no hard
 * dependency on the agent package; it accepts whichever shape the agent
 * passes that is structurally compatible with this interface.
 */
export interface ProfileContext {
  name: string;
  dataDir: string;
  logger: {
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
  };
  audit?: {
    emit: (event: string, payload?: unknown) => void;
  };
}

/**
 * Minimal VibePlugin shape this meta package returns from its
 * createPlugin(ctx) factory. The storage facade has no routes / CLI /
 * lifecycle hooks of its own — it ships solely so concrete adapters
 * (Skalex, Postgres) can register themselves on import. The factory is
 * required to satisfy Plugin Contract v2 in the agent's loader.
 */
export interface VibeStoragePlugin {
  name: string;
  version: string;
  description: string;
  tags?: ReadonlyArray<string>;
}

export type VibePluginFactory = (ctx: ProfileContext) => VibeStoragePlugin;

/**
 * Plugin Contract v2 factory. Returns a no-op meta plugin record; all
 * actual storage capability is exposed via the named exports below
 * (registerAdapter / createAgentDatabase / AgentDatabase).
 */
export const createPlugin: VibePluginFactory = (
  _ctx: ProfileContext,
): VibeStoragePlugin => ({
  name: "storage",
  version: "2026.508.4",
  description:
    "Storage facade — owns AgentDatabase contract and adapter registry",
  tags: ["backend", "adapter"],
});

export default createPlugin;

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
