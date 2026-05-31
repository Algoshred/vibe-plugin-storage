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
 *
 * Plugin contract / host service / lifecycle helpers come from
 * @vibecontrols/plugin-sdk — they are NOT redeclared here. The
 * storage-domain contracts (`AgentDatabase`, `StorageProvider`,
 * adapter-registry types) STAY inline because they are storage-domain
 * shapes, not SDK surface.
 */

import {
  type HostServices,
  type ProfileContext,
  type VibePlugin,
  type VibePluginFactory,
} from "@vibecontrols/plugin-sdk/contract";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join as joinPath } from "node:path";
import { fileURLToPath } from "node:url";
import { createLifecycleHooks } from "@vibecontrols/plugin-sdk/lifecycle";
import { BoundLogger } from "@vibecontrols/plugin-sdk/log";
import { TelemetryEmitter } from "@vibecontrols/plugin-sdk/telemetry";

import { createSkalexAgentDatabase } from "@vibecontrols/vibe-plugin-storage-skalex";
import { registerAdapter as registerAdapterImpl } from "./registry.js";

// Auto-register the bundled Skalex adapter.
registerAdapterImpl("skalex", createSkalexAgentDatabase);

const PLUGIN_NAME = "storage";
const PLUGIN_PACKAGE_NAME = "@vibecontrols/vibe-plugin-storage";
const PLUGIN_VERSION = getPluginVersion();

function getPluginVersion(): string {
  try {
    let dir = dirname(fileURLToPath(import.meta.url));
    for (let i = 0; i < 10 && dir && dir !== dirname(dir); i++) {
      const pkgPath = joinPath(dir, "package.json");
      if (existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
            name?: string;
            version?: string;
          };
          if (
            pkg.name === PLUGIN_PACKAGE_NAME &&
            typeof pkg.version === "string"
          ) {
            return pkg.version;
          }
        } catch {
          /* malformed package.json — keep walking up */
        }
      }
      dir = dirname(dir);
    }
  } catch {
    /* fall through */
  }
  return "0.0.0";
}

/**
 * Plugin Contract v2 factory. Returns a meta plugin that has no routes
 * or CLI surface of its own — actual storage capability is exposed via
 * the named exports below (registerAdapter / createAgentDatabase /
 * AgentDatabase). The factory wires lifecycle hooks for the agent's
 * loader so we can announce readiness via telemetry on start.
 */
export const createPlugin: VibePluginFactory = (
  ctx: ProfileContext,
): VibePlugin => {
  const log = new BoundLogger(ctx.logger, PLUGIN_NAME);
  const lifecycle = createLifecycleHooks({
    name: PLUGIN_NAME,
    telemetryEventName: "storage.ready",
    onInit: (hostServices: HostServices) => {
      const telemetry = new TelemetryEmitter(
        PLUGIN_NAME,
        PLUGIN_VERSION,
        hostServices,
      );
      telemetry.emitReady();
      log.info("storage meta plugin ready (skalex adapter auto-registered)");
    },
  });

  return {
    name: PLUGIN_NAME,
    version: PLUGIN_VERSION,
    description:
      "Storage facade — owns AgentDatabase contract and adapter registry",
    tags: ["backend", "adapter"],
    metaProviders: [
      {
        packageName: "@vibecontrols/vibe-plugin-storage-skalex",
        pluginName: "storage-skalex",
        defaultOn: ["linux", "darwin", "win32"],
      },
      {
        packageName: "@vibecontrols/vibe-plugin-storage-postgres",
        pluginName: "storage-postgres",
      },
    ],
    capabilities: {
      storage: "rw",
    },
    onServerStart: lifecycle.onServerStart,
    onServerStop: lifecycle.onServerStop,
  };
};

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
