import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected To: ${connect.connection.host}`);
    } 
    catch (error) {
        console.error("Couldn't connect to MongoDB", error);
        process.exit(1);
    }
}; 

export default connectDb;