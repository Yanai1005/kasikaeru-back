-- ユーザーテーブル
CREATE TABLE users (
    discord_id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- カテゴリテーブル
CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name VARCHAR(255) NOT NULL
);

-- 備品テーブル
CREATE TABLE objects (
    object_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code_value VARCHAR(255) UNIQUE NOT NULL,
    object_name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- 貸出記録テーブル
CREATE TABLE lent_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lent_id VARCHAR(255) UNIQUE NOT NULL,
    object_id INTEGER NOT NULL,
    discord_id VARCHAR(255) NOT NULL,
    lent_state BOOLEAN NOT NULL DEFAULT true,
    lent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (object_id) REFERENCES objects(object_id),
    FOREIGN KEY (discord_id) REFERENCES users(discord_id)
);

-- インデックスの作成
CREATE INDEX idx_objects_category ON objects(category_id);
CREATE INDEX idx_lent_records_object ON lent_records(object_id);
CREATE INDEX idx_lent_records_user ON lent_records(discord_id);
CREATE INDEX idx_lent_records_state ON lent_records(lent_state);
