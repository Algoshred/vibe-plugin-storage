/**
 * Storage Adapter Registry
 *
 * In-process registry keyed by adapter name. Concrete storage providers
 * (e.g. @vibecontrols/vibe-plugin-storage-skalex) call `registerAdapter`
 * on import. Users can register custom adapters before calling
 * `createAgentDatabase()`, or pass `adapterName: "custom:/abs/path/to/mod.js"`
 * at runtime for zero-build pluggability.
 */

import type { AgentStorageAdapterFactory } from "./types.js";

const registry = new Map<string, AgentStorageAdapterFactory>();

export function registerAdapter(
  name: string,
  factory: AgentStorageAdapterFactory,
): void {
  registry.set(name, factory);
}

export function getAdapter(
  name: string,
): AgentStorageAdapterFactory | undefined {
  return registry.get(name);
}

export function listAdapters(): string[] {
  return Array.from(registry.keys());
}
