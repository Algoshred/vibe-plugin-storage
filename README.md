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

## License

Proprietary — Burdenoff Consultancy Services Pvt. Ltd.
