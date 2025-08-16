export type Bindings = {
    DB: D1Database;
    ASSETS: Fetcher;
};

export type Variables = {};

export type HonoEnv = {
    Bindings: Bindings;
    Variables: Variables;
};
