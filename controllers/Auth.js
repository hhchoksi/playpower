import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { set, get, del } from "../controllers/redisFunctions.js";
import e from "express";

export const signUp = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if(!username || !password || !email) {
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
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res.status(400).json({ error: "Please fill all fields" });
      }
  
      // Check if username exists in Redis
      const checkExistingRedis = await get(username);
      if (checkExistingRedis != null) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if username exists in the database
      const existingUser = await User.findOne({ username: username });
      if (existingUser !== null) {
        return res.status(400).json({ error: "Username already exists" });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create the user
      const newUser = await User.create({
        username: username,
        password: hashedPassword,
      });
  
      await set(username,"User Exists", process.env.TTL_SignUp);
  
      return res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: newUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: "Internal Server Error",
        success: false,
        message: "User registration failed",
      });
    }
  };
  

  export const login = async (req, res) => {
    try {
      const { username, password } = req.body;
  
      if (!username || !password) {
        return res.status(400).json({ error: "Please fill all fields" });
      }
  
      let cachedToken = await get(username);

      if (cachedToken) {
        return res.status(200).json({
          message: "User logged in successfully (from cache)",
          success: true,
          token: cachedToken,
          user: { username: username, token: cachedToken },  // Return the cached token and username
        });
      }
  
      let user = await User.findOne({ username: username });
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
  
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ error: "Incorrect password" });
      }
  
      // Generate a new token if authentication is successful
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "72h",
      });
  
      user = user.toObject();
      user.token = token;
      user.password = undefined;
  
      const options = {
        expires: new Date(Date.now() + 72 * 60 * 60 * 1000),
        httpOnly: true,
      };
  
      // Cache the generated token in Redis with a TTL of 72 hours (259200 seconds)
      await set(username, token, 259200);  // Set token in Redis with TTL of 72h
  
      // Return response and set cookie with the token
      res.cookie("token", token, options).status(200).json({
        message: "User logged in successfully",
        success: true,
        token: token,
        user: user,
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
        success: false,
        message: "User login failed",
      });
    }
  };