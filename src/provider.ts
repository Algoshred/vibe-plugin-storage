/**
 * StorageProvider Interface
 *
 * KV store abstraction for plugin data. Plugins use this interface
 * to persist key-value data without coupling to a specific database.
 *
 * Values are JSON strings — plugins serialize/deserialize as needed.
 * Each plugin gets its own namespace for isolation.
 *
 * Default implementation: encrypted Skalex-backed agent storage,
 * provided by @vibecontrols/vibe-plugin-storage-skalex.
 */

import type { StorageEntry } from "./types.js";

export interface StorageProvider {
  /**
   * Get a value by namespace and key.
   * Returns null if the key doesn't exist.
   */
  get(namespace: string, key: string): Promise<string | null>;

  /**
   * Set a value by namespace and key (upsert).
   */
  set(namespace: string, key: string, value: string): Promise<void>;

  /**
   * Delete a specific key from a namespace.
   * Returns true if the key existed and was deleted.
   */
  delete(namespace: string, key: string): Promise<boolean>;

  /**
   * List all key-value pairs in a namespace.
   */
  list(namespace: string): Promise<StorageEntry[]>;

  /**
   * Delete all entries in a namespace.
   * Returns the number of entries deleted.
   */
  deleteAll(namespace: string): Promise<number>;
}
