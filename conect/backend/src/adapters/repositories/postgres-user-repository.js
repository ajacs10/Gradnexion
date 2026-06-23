// src/adapters/repositories/postgres-user-repository.js
import { UserPort } from '../../core/ports/user-port.js';
import { query } from '../../db.js';

export class PostgresUserRepository extends UserPort {
  async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async findByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  }

  async create(user, client) {
    const q = client ? client.query.bind(client) : query;
    const result = await q(
      'INSERT INTO users (role, username, password_hash, password_salt) VALUES ($1, $2, $3, $4) RETURNING id, role, username',
      [user.role, user.username, user.passwordHash, user.passwordSalt]
    );
    return result.rows[0];
  }
}
