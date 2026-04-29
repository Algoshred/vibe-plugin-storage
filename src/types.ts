/**
 * Storage Adapter Contract
 *
 * Defines the 45-method interface every concrete storage adapter must
 * implement. Callers import the abstract `AgentDatabase` class — the
 * concrete adapter (e.g. Skalex via @vibecontrols/vibe-plugin-storage-skalex)
 * is resolved at startup via the adapter registry and returned by
 * `createAgentDatabase()`.
 *
 * Any third-party storage layer can be plugged in by implementing this
 * class and either registering it with a name (see ./registry.ts) or
 * passing a factory directly to createAgentDatabase().
 *
 * Encryption at rest is MANDATORY for any adapter that persists data.
 * Every adapter MUST use the provided encryption key.
 */

// ── Domain entities (data shapes the storage layer manages) ─────────────

export interface StorageEntry {
  key: string;
  value: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  type: "command" | "script" | "file_operation";
  status: "pending" | "running" | "completed" | "failed";
  payload: string;
  result?: string;
  error?: string;
  calendarTaskId?: string;
  exitCode?: number;
  timeout?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GitRepository {
  id: string;
  path: string;
  name: string;
  parentPath?: string;
  isSubmodule: boolean;
  projectType?: string;
  vitePort?: number;
  lastScanned: string;
  createdAt: string;
}

export interface BookmarkedCommand {
  id: string;
  projectId?: string;
  command: string;
  description?: string;
  category?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  sessionName?: string;
  projectId?: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
}

// ── Adapter factory ─────────────────────────────────────────────────────

/**
 * Options passed to an adapter factory. Every adapter receives the resolved
 * data directory and the AES-256 encryption key (64-hex).
 */
export interface AgentStorageAdapterOptions {
  dataDir: string;
  encryptionKey: string;
  /**
   * Free-form, adapter-interpreted knobs forwarded by the host. The agent
   * does NOT interpret these — adapters pick out the keys they care
   * about. Example: postgres reads `connectionString`; an S3-backed
   * adapter might read `bucket` + `region`. Keeps the agent decoupled
   * from any backend's specifics.
   */
  adapterOptions?: Readonly<Record<string, string>>;
}

/**
 * Factory signature for a storage adapter. Factories are responsible for
 * constructing the concrete subclass AND calling its internal init hook
 * (e.g. Skalex's connect()), then returning a ready-to-use instance.
 */
export type AgentStorageAdapterFactory = (
  opts: AgentStorageAdapterOptions,
) => Promise<AgentDatabase>;

// ── Abstract storage contract ───────────────────────────────────────────

/**
 * Abstract storage contract. This is both the public type callers import
 * and the base class every adapter extends. All methods are async.
 */
export abstract class AgentDatabase {
  // ── Lifecycle ───────────────────────────────────────────────────────

  abstract close(): Promise<void>;
  abstract getDbPath(): string;

  // ── Task Methods ────────────────────────────────────────────────────

  abstract createTask(
    task: Omit<Task, "createdAt" | "updatedAt">,
  ): Promise<Task>;
  abstract getTask(id: string): Promise<Task | undefined>;
  abstract getAllTasks(): Promise<Task[]>;
  abstract getPendingTasks(): Promise<Task[]>;
  abstract updateTask(id: string, updates: Partial<Task>): Promise<void>;
  abstract cancelTask(id: string): Promise<boolean>;

  // ── Config Methods ──────────────────────────────────────────────────

  abstract getConfig(key: string): Promise<string | undefined>;
  abstract setConfig(key: string, value: string): Promise<void>;
  abstract deleteConfig(key: string): Promise<boolean>;
  abstract getAllConfig(): Promise<Record<string, string>>;
  abstract bulkSetConfig(entries: Record<string, string>): Promise<void>;
  abstract getConfigStatus(): Promise<{
    totalKeys: number;
    lastUpdated: string | null;
  }>;

  // ── Git Repository Methods ──────────────────────────────────────────

  abstract createGitRepository(
    repo: Omit<GitRepository, "createdAt" | "lastScanned">,
  ): Promise<GitRepository>;
  abstract getGitRepository(id: string): Promise<GitRepository | undefined>;
  abstract getGitRepositoryByPath(
    path: string,
  ): Promise<GitRepository | undefined>;
  abstract getAllGitRepositories(): Promise<GitRepository[]>;
  abstract updateGitRepository(
    id: string,
    updates: Partial<GitRepository>,
  ): Promise<void>;
  abstract deleteGitRepository(id: string): Promise<boolean>;
  abstract fixGitHierarchy(): Promise<{ fixed: number }>;

  // ── Bookmarked Command Methods ──────────────────────────────────────

  abstract createBookmarkedCommand(
    cmd: Omit<BookmarkedCommand, "createdAt">,
  ): Promise<BookmarkedCommand>;
  abstract getBookmarkedCommand(
    id: string,
  ): Promise<BookmarkedCommand | undefined>;
  abstract getAllBookmarkedCommands(): Promise<BookmarkedCommand[]>;
  abstract getBookmarkedCommandsByProject(
    projectId: string | null,
  ): Promise<BookmarkedCommand[]>;
  abstract getBookmarkedCommandsByCategory(
    category: string,
  ): Promise<BookmarkedCommand[]>;
  abstract updateBookmarkedCommand(
    id: string,
    updates: Partial<BookmarkedCommand>,
  ): Promise<void>;
  abstract deleteBookmarkedCommand(id: string): Promise<boolean>;
  abstract executeBookmarkedCommand(
    id: string,
  ): Promise<BookmarkedCommand | undefined>;

  // ── Notification Methods ────────────────────────────────────────────

  abstract createNotification(
    notification: Omit<Notification, "createdAt">,
  ): Promise<Notification>;
  abstract getNotification(id: string): Promise<Notification | undefined>;
  abstract getAllNotifications(): Promise<Notification[]>;
  abstract getNotificationsByProject(
    projectId: string | null,
  ): Promise<Notification[]>;
  abstract getGlobalNotifications(): Promise<Notification[]>;
  abstract getUnreadNotifications(): Promise<Notification[]>;
  abstract updateNotificationStatus(
    id: string,
    status: "unread" | "read",
  ): Promise<void>;
  abstract markAllNotificationsRead(): Promise<number>;
  abstract deleteNotification(id: string): Promise<boolean>;
  abstract clearOldNotifications(olderThanDays?: number): Promise<number>;

  // ── Plugin State Methods ────────────────────────────────────────────

  abstract getPluginState(
    pluginName: string,
    key: string,
  ): Promise<string | undefined>;
  abstract setPluginState(
    pluginName: string,
    key: string,
    value: string,
  ): Promise<void>;
  abstract deletePluginState(pluginName: string, key: string): Promise<boolean>;
  abstract getAllPluginState(pluginName: string): Promise<StorageEntry[]>;
  abstract deleteAllPluginState(pluginName: string): Promise<number>;
}
