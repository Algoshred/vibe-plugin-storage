# @vibecontrols/vibe-plugin-storage

Storage meta plugin for the VibeControls agent.

Defines the storage contract that the agent uses to persist its state, and the adapter registry that concrete storage providers (such as `@vibecontrols/vibe-plugin-storage-skalex`) plug into.

## Exports

- `AgentDatabase` — abstract 45-method storage contract.
- `StorageProvider` — KV-store interface plugins use for their data.
- `createAgentDatabase(options)` — factory that resolves the concrete adapter at runtime.
- `registerAdapter(name, factory)` / `getAdapter` / `listAdapters` — adapter registry.

## Example: registering a custom adapter

```ts
import {
  registerAdapter,
  AgentDatabase,
} from "@vibecontrols/vibe-plugin-storage";

class MyPostgresAdapter extends AgentDatabase {
  // implement 45 methods…
}

registerAdapter("postgres", async ({ dataDir, encryptionKey }) => {
  const db = new MyPostgresAdapter(/* … */);
  await db.connect();
  return db;
});
```

Then run the agent with:

```bash
VIBE_STORAGE_ADAPTER=postgres vibe start
```

<!-- VIBECONTROLS_OSS_FOOTER_START -->

---

## About VibeControls

**VibeControls** is the agentic engineering mission control for AI-native teams. Vibe-plugins extend the VibeControls agent with new providers, tools, sessions, tunnels, storage backends, and security stages.

- Website: <https://vibecontrols.com>
- Documentation: <https://docs.vibecontrols.com>
- Plugin SDK: <https://github.com/algoshred/vibecontrols-plugin-sdk>
- All plugins: <https://github.com/algoshred?q=vibe-plugin-&type=all>

## License

Released under the [MIT License](./LICENSE).

Copyright (c) 2026 Burdenoff Consultancy Services Private Limited, Algoshred Technologies Private Limited, and all its sister companies.

Maintainer: **Vignesh T.V** — <https://github.com/tvvignesh>

**Note**: this plugin is open source under MIT. The `@vibecontrols/agent` runtime that loads and orchestrates plugins is **closed source** and proprietary to Burdenoff Consultancy Services Pvt. Ltd. If you want a fully self-hostable agent, please open an issue or contact the maintainer.

<!-- VIBECONTROLS_OSS_FOOTER_END -->
