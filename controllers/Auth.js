import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const signUp = async (req, res) => {
    try {
        const { username, password } = req.body;

        if(!username || !password) {
            return res.status(400).json({ error: 'Please fill all fields' });
        }

        const existing = await User.findOne({ username: username });
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username: username,
            password: hashedPassword
        });

        return res.status(200).json({
            message: 'User registered successfully',
            success: true,
            user: user
        });
    } 
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error,
            success: false,
            message: 'User registration failed'
        })
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if(!username ||!password) {
            return res.status(400).json({ error: 'Please fill all fields' });
        }

        let user = await User.findOne({ username: username });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '72h' });

        user = user.toObject();
        user.token = token;
        user.password = undefined;
        const options = {
            expires: new Date(Date.now() + 72 * 60 * 60 * 1000),
            httpOnly: true
        }

        res.cookie("token", token, options).status(200).json({
            message: 'User logged in successfully',
            success: true,
            token: token,
            user: user
        });
    } 
    catch (error) {
        return res.status(500).json({
            error: error,
            success: false,
            message: 'User login failed'
        });
    }
};

