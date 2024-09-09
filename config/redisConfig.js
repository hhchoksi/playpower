import redis from "redis";
import dotenv from "dotenv";

dotenv.config();

const connectToRedis = () => {
  return new Promise((resolve, reject) => {
    const client = redis.createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10),
      },
    });

    client
      .connect()
      .then(() => {
        console.log("Connected to Redis");
        resolve(client);
      })
      .catch((error) => {
        console.error("Failed to connect to Redis:", error);
        reject(error);
      });
  });
};

export const connectAndLogRedisStatus = async () => {
  try {
    const client = await connectToRedis();
    console.log("Redis client is ready for use");
    return client;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
};

export default connectAndLogRedisStatus;
