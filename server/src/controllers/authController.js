import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { query, memoryStore } from '../config/db.js';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

function sendAuthResponse(user, res, statusCode = 200) {
  const token = generateToken(user);

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('stylesense_token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message: 'Authentication successful',
    token, // Also return in body for testing & client token storage
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }
  });
}

/**
 * Register a new customer
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.'
      });
    }

    // Check duplicate
    const existing = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    if (memoryStore.users) {
      const newUser = {
        id: memoryStore.nextId.users++,
        name: name.trim(),
        email: cleanEmail,
        password_hash,
        role: 'customer',
        created_at: new Date()
      };
      memoryStore.users.push(newUser);

      // Initialize empty cart for user
      const newCart = {
        id: memoryStore.nextId.carts++,
        user_id: newUser.id,
        created_at: new Date(),
        updated_at: new Date()
      };
      memoryStore.carts.push(newCart);

      return sendAuthResponse(newUser, res, 201);
    }

    const insertResult = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, password_hash, 'customer']
    );

    const userId = insertResult.insertId;
    await query('INSERT INTO carts (user_id) VALUES (?)', [userId]);

    const createdUser = { id: userId, name: name.trim(), email: cleanEmail, role: 'customer' };
    return sendAuthResponse(createdUser, res, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * Sign in existing user
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user;

    if (memoryStore.users) {
      user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    } else {
      const users = await query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
      if (users && users.length > 0) user = users[0];
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    return sendAuthResponse(user, res, 200);
  } catch (error) {
    next(error);
  }
}

/**
 * Sign out and clear session cookie
 */
export async function logout(req, res) {
  res.clearCookie('stylesense_token');
  return res.status(200).json({
    success: true,
    message: 'Signed out successfully.'
  });
}

/**
 * Get current authenticated user profile and preferences
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    let prefs = null;

    if (memoryStore.user_preferences) {
      prefs = memoryStore.user_preferences.find(p => p.user_id === userId) || null;
    } else {
      const rows = await query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
      if (rows && rows.length > 0) prefs = rows[0];
    }

    return res.status(200).json({
      success: true,
      user: {
        ...req.user,
        preferences: prefs
      }
    });
  } catch (error) {
    next(error);
  }
}
