import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

export const signToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'foodbridge_default_jwt_secret_key_2026';
  return jwt.sign({ id: userId }, secret, {
    expiresIn: '7d'
  });
};

/**
 * Generates a cryptographically secure 6-digit handover PIN
 */
export const generateHandoverCode = () => {
  const randomBuffer = crypto.randomBytes(4);
  const number = (randomBuffer.readUInt32BE(0) % 900000) + 100000;
  return number.toString();
};

/**
 * Hashes the handover code using SHA-256 for secure database storage
 */
export const hashHandoverCode = (code) => {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
};
