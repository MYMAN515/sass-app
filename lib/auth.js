// lib/auth.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Hash a plain password securely.
 * @param {string} plainPassword - User's plain password
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, 10);
}

/**
 * Compare a plain password with a hashed one.
 * @param {string} plainPassword - User input
 * @param {string} hashedPassword - Stored hash
 * @returns {Promise<boolean>} - True if matches
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate a signed JWT token.
 * @param {object} payload - Data to encode in token
 * @returns {string} - JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '1d',
  });
}

/**
 * Verify a JWT token and decode its payload.
 * @param {string} token - JWT token
 * @returns {object} - Decoded payload
 */
export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
}
