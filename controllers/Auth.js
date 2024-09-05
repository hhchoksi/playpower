import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';

const signUp = async () => {
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

export { signUp };


