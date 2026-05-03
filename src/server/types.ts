export type Env = {
  DB: D1Database;
  SESSIONS: KVNamespace;
  DISCOGS_USER_TOKEN: string;
  APP_SECRET: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "writer" | "admin";
};

export type SessionRecord = {
  userId: string;
  role: "writer" | "admin";
  expiresAt: number;
};
