
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const router = express.Router();

// EMPLOYEE REGISTRATION
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email and password are required.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must contain at least 8 characters.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check whether email already exists
        const [existingUsers] = await db.query(
            'SELECT user_id FROM users WHERE email = ?',
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: 'Email is already registered.'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Public registration creates Employee accounts only
        const [result] = await db.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES (?, ?, ?, ?)`,
            [name.trim(), normalizedEmail, passwordHash, 'Employee']
        );

        return res.status(201).json({
            message: 'Employee registered successfully!',
            user: {
                user_id: result.insertId,
                name: name.trim(),
                email: normalizedEmail,
                role: 'Employee'
            }
        });

    } catch (error) {
        console.error('Registration error:', error.message);

        return res.status(500).json({
            message: 'Unable to register user.'
        });
    }
});


// USER LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find user
        const [users] = await db.query(
            `SELECT user_id, name, email, password_hash, role
             FROM users
             WHERE email = ?`,
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        const user = users[0];

        // Compare password with stored hash
        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );

        return res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            message: 'Unable to login.'
        });
    }
});

module.exports = router;
