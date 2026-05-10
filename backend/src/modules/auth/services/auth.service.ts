import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../../../database/db';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  static async login(email: string, pass: string) {
    console.log(`[AUTH] Attempting login for: ${email}`);
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
      console.log(`[AUTH] User found: ${user ? 'Yes' : 'No'}`);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'super-secret-hardened-key-2026',
      { expiresIn: '24h' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
    } catch (error) {
      console.error('[AUTH ERROR] Login failed:', error);
      throw error;
    }
  }

  static async register(userData: any) {
    const { email, password, first_name, last_name, role } = userData;
    
    // Check if user exists
    const checkUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      throw new Error('Email already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role',
      [email, passwordHash, first_name, last_name, role || 'ATHLETE']
    );

    return result.rows[0];
  }

  static async getMe(userId: string) {
    const result = await pool.query('SELECT id, email, first_name, last_name, role, status FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  }
}
