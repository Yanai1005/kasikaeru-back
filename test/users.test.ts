import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import users from '../src/routes/users';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

// モック
const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User 1',
        email: 'test1@example.com',
        created_at: '2024-01-01T00:00:00Z'
    },
    {
        id: 2,
        name: 'Test User 2',
        email: 'test2@example.com',
        created_at: '2024-01-02T00:00:00Z'
    }
];

describe('Users API', () => {
    it('should fetch all users successfully', async () => {
        const app = new Hono();
        app.route('/users', users);

        const mockDB = {
            prepare: vi.fn().mockReturnValue({
                all: vi.fn().mockResolvedValue({ results: mockUsers })
            })
        };

        const req = new Request('http://localhost/users', {
            method: 'GET',
        });

        const env = {
            DB: mockDB,
            ALLOWED_ORIGINS: 'http://localhost:3000'
        };

        const res = await app.fetch(req, env);

        expect(res.status).toBe(200);
        const data = await res.json() as User[];
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(2);
        expect(data[0]).toHaveProperty('id');
        expect(data[0]).toHaveProperty('name');
        expect(data[0]).toHaveProperty('email');
        expect(data[0].name).toBe('Test User 1');
        expect(data[1].name).toBe('Test User 2');

        expect(mockDB.prepare).toHaveBeenCalledWith('SELECT * FROM users');
    });

    it('should handle database errors gracefully', async () => {
        const app = new Hono();
        app.route('/users', users);

        const mockDB = {
            prepare: vi.fn().mockReturnValue({
                all: vi.fn().mockRejectedValue(new Error('Database connection failed'))
            })
        };

        const req = new Request('http://localhost/users', {
            method: 'GET',
        });

        const env = {
            DB: mockDB,
            ALLOWED_ORIGINS: 'http://localhost:3000'
        };

        const res = await app.fetch(req, env);

        // エラーレスポンスを検証
        expect(res.status).toBe(500);
        const data = await res.json() as { error: string };
        expect(data).toHaveProperty('error');
        expect(data.error).toBe('Failed to fetch users');
    });

    it('should return empty array when no users exist', async () => {
        // Honoアプリのインスタンスを作成
        const app = new Hono();
        app.route('/users', users);

        // 空の結果を返すモックDB
        const mockDB = {
            prepare: vi.fn().mockReturnValue({
                all: vi.fn().mockResolvedValue({ results: [] })
            })
        };

        const req = new Request('http://localhost/users', {
            method: 'GET',
        });

        const env = {
            DB: mockDB,
            ALLOWED_ORIGINS: 'http://localhost:3000'
        };

        const res = await app.fetch(req, env);

        expect(res.status).toBe(200);
        const data = await res.json() as User[];
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
    });
});
