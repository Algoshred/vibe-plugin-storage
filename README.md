# @vibecontrols/vibe-plugin-storage

<!-- VIBECONTROLS_OSS_HEADER_START -->

> **License**: MIT — see [LICENSE](./LICENSE).
> **Note**: This plugin is open source. The `@vibecontrols/agent` runtime that loads it is **not** open source — it is a proprietary product of Burdenoff Consultancy Services Pvt. Ltd. See [vibecontrols.com](https://vibecontrols.com) for the agent.

<!-- VIBECONTROLS_OSS_HEADER_END -->

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

## License

Released under the [MIT License](./LICENSE).

Copyright (c) 2026 Burdenoff Consultancy Services Private Limited, Algoshred Technologies Private Limited, and all its sister companies.

Maintainer: **Vignesh T.V** — <https://github.com/tvvignesh>

## About VibeControls

**VibeControls** is the agentic engineering mission control for AI-native teams. Vibe-plugins extend the VibeControls agent with new providers, tools, sessions, tunnels, storage backends, and security stages.

- Website: <https://vibecontrols.com>
- Documentation: <https://docs.vibecontrols.com>
- Plugin SDK: <https://github.com/algoshred/vibecontrols-plugin-sdk>
- All plugins: <https://github.com/algoshred?q=vibe-plugin-&type=all>

## Important: agent is not open source

The `@vibecontrols/agent` runtime that loads and orchestrates these plugins is **closed source** and proprietary to Burdenoff Consultancy Services Pvt. Ltd. Only the plugin contract and the plugins themselves are released under MIT. If you want a fully self-hostable agent, please open an issue or contact the maintainer.

<!-- VIBECONTROLS_OSS_FOOTER_END -->
