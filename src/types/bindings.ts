export type Bindings = {
    DB: D1Database;
    ASSETS: Fetcher;
    NODE_ENV?: string;
    ALLOWED_ORIGINS?: string;
};

export type Variables = {};

export type HonoEnv = {
    Bindings: Bindings;
    Variables: Variables;
};
