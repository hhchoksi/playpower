import express from "express";
import dotenv from 'dotenv';
import connectDb from "./config/database.js";
import bodyParser from "body-parser";

const app = express();
dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

connectDb();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});