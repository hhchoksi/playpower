import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if(!token) {
            return res.status(401).json({ error: 'Token not present' });
        }

        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decode;
            next();
        } 
        catch (error) {
            return res.status(401).json({ 
                error: 'Invalid token',
                message: error.message,
                success: false 
            });
        }
    } 
    catch (error) {
        
    }
};