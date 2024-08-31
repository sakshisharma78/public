const express = require('express');
const router = express.Router();
const passport = require('passport');
const UserModel = require('../Models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const protect = require('../Middleware/authMiddleware');
const session = require('express-session');
require('../passport-setup');  // Import passport configuration

// Setup session
router.use(session({
    secret: 'shreejii123',  // Use a strong secret
    resave: false,
    saveUninitialized: true
}));

// Initialize passport
router.use(passport.initialize());
router.use(passport.session());

// Register User
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, contact, email, password, confirmPassword } = req.body;

        const checkEmail = await UserModel.findOne({ email });
        if (checkEmail) {
            return res.status(400).json({
                message: "User already exists",
                error: true,
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match",
                error: true,
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new UserModel({
            firstName,
            lastName,
            contact,
            email,
            password: hashedPassword
        });

        const userSave = await user.save();

        return res.status(201).json({
            message: "User created successfully",
            data: userSave,
            success: true
        });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({
            message: error.message || "An error occurred during registration",
            error: true
        });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials",
                error: true,
            });
        }

        const tokenData = {
            id: user._id,
            email: user.email
        };
        const token = jwt.sign(tokenData, "sakshisharma123", { expiresIn: '1d' });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            token,
            email,
            name: user.firstName + ' ' + user.lastName
        });
    } catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({
            message: error.message || "An error occurred during login",
            error: true,
        });
    }
});

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback', passport.authenticate('google', { 
    failureRedirect: '/login', 
    session: false 
}), (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, "sakshisharma123", { expiresIn: '1d' });
    res.redirect(`/dashboard?token=${token}`);  // Redirect to your dashboard with JWT token
});

// LinkedIn OAuth routes
router.get('/auth/linkedin', passport.authenticate('linkedin', {
    scope: ['r_liteprofile', 'r_emailaddress']
}));

router.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
    failureRedirect: '/login', 
    session: false 
}), (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, "sakshisharma123", { expiresIn: '1d' });
    res.redirect(`/dashboard?token=${token}`);  // Redirect to your dashboard with JWT token
});

// GitHub OAuth routes
router.get('/auth/github', passport.authenticate('github', {
    scope: ['user:email']
}));

router.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/login', 
    session: false 
}), (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, "sakshisharma123", { expiresIn: '1d' });
    res.redirect(`/dashboard?token=${token}`);  // Redirect to your dashboard with JWT token
});
// Example of route using the `protect` middleware:
router.get('/dashboard', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const userdetails = await UserModel.findById(userId).select('-password');
        if (!userdetails) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(userdetails);
    } catch (err) {
        res.status(500).json({ message: 'Some error occurred', error: err.message });
    }
});

module.exports = router;
