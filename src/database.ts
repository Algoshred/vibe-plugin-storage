/**
 * Agent Database (pluggable adapter façade)
 *
 * The public import surface for all storage operations:
 *
 *   import { createAgentDatabase } from "@vibecontrols/vibe-plugin-storage";
 *   const db = await createAgentDatabase({ encryptionKey, dbPath });
 *
 * `createAgentDatabase` resolves the concrete adapter at runtime:
 *   1. options.adapterFactory (explicit override; tests use this)
 *   2. options.adapterName (e.g. "skalex" or "custom:/path/to/mod.js")
 *   3. process.env.VIBE_STORAGE_ADAPTER
 *   4. "skalex" (default — provided by @vibecontrols/vibe-plugin-storage-skalex)
 *
 * Encryption is mandatory. If no encryption key is supplied, startup fails.
 */

import { AgentDatabase, type AgentStorageAdapterFactory } from "./types.js";
import { getAdapter, listAdapters } from "./registry.js";

export interface AgentDatabaseCreateOptions {
  /** Absolute path to the storage directory. REQUIRED — host must resolve it. */
  dbPath: string;
  /** 64-character hex AES-256 key. REQUIRED — startup fails without it. */
  encryptionKey: string;
  /**
   * Named adapter to use. Defaults to the value of VIBE_STORAGE_ADAPTER
   * (env), or "skalex" if unset. Prefix a path with "custom:" to load a
   * module from disk at runtime (e.g. "custom:/opt/my-adapter.mjs").
   */
  adapterName?: string;
  /**
   * Direct factory override. Highest priority — bypasses adapterName and
   * the registry entirely. Tests use this to swap in an in-memory adapter.
   */
  adapterFactory?: AgentStorageAdapterFactory;
  /**
   * Free-form adapter knobs forwarded verbatim. The agent never interprets
   * these — they go directly to the chosen adapter's factory under
   * `opts.adapterOptions`. Example for postgres:
   *   { connectionString: "postgres://user:pass@host:5432/db" }
   */
  adapterOptions?: Readonly<Record<string, string>>;
}

async function resolveFactory(
  options: AgentDatabaseCreateOptions,
): Promise<AgentStorageAdapterFactory> {
  if (options.adapterFactory) return options.adapterFactory;

  const name =
    options.adapterName ?? process.env.VIBE_STORAGE_ADAPTER ?? "skalex";

  if (name.startsWith("custom:")) {
    const modPath = name.slice("custom:".length);
    if (!modPath) {
      throw new Error(
        "VIBE_STORAGE_ADAPTER=custom: requires a module path after the colon",
      );
    }
    const mod = (await import(modPath)) as {
      default?: AgentStorageAdapterFactory;
      createAdapter?: AgentStorageAdapterFactory;
    };
    const factory = mod.default ?? mod.createAdapter;
    if (typeof factory !== "function") {
      throw new Error(
        `Custom storage adapter at ${modPath} must export a default function (or \`createAdapter\`) of type AgentStorageAdapterFactory`,
      );
    }
    return factory;
  }

  let factory = getAdapter(name);
  if (!factory) {
    // Lazy-load known well-known adapter packages by name, so the host
    // (the agent) doesn't need to statically import any specific
    // provider — it only depends on this meta plugin. Anything else
    // requires the operator to install + import the adapter package
    // before calling createAgentDatabase().
    const wellKnown: Record<string, string> = {
      skalex: "@vibecontrols/vibe-plugin-storage-skalex",
      postgres: "@vibecontrols/vibe-plugin-storage-postgres",
      postgresql: "@vibecontrols/vibe-plugin-storage-postgres",
    };
    const candidate = wellKnown[name];
    if (candidate) {
      try {
        await import(candidate);
        factory = getAdapter(name);
      } catch {
        /* fall through to the descriptive error below */
      }
    }
  }
  if (!factory) {
    throw new Error(
      `Unknown storage adapter: "${name}". Registered adapters: ${listAdapters().join(", ") || `(none — did you install @vibecontrols/vibe-plugin-storage-${name})?`}`,
    );
  }
  return factory;
}

/**
 * Create an AgentDatabase instance. Picks the concrete adapter at
 * runtime, initialises it, and returns the ready-to-use instance.
 * Throws if no encryption key is supplied (storage is always encrypted).
 */
export async function createAgentDatabase(
  options: AgentDatabaseCreateOptions,
): Promise<AgentDatabase> {
  if (!options.encryptionKey) {
    throw new Error(
      "createAgentDatabase(): encryptionKey is required. Storage is always encrypted at rest.",
    );
  }
  if (!options.dbPath) {
    throw new Error("createAgentDatabase(): dbPath is required.");
  }
  const factory = await resolveFactory(options);
  return factory({
    dataDir: options.dbPath,
    encryptionKey: options.encryptionKey,
    adapterOptions: options.adapterOptions,
  });
}
