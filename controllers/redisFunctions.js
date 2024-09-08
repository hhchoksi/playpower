import {redisClient} from '../index.js'



export const get = async (key) => {
    try {
      const value = await redisClient.get(key);
      if (value === null) {
        console.log(`Key ${key} not found`);
        return null;
      }
      console.log(`Successfully retrieved value for key ${key}`);
      return value;
    } catch (error) {
      console.error(`Error retrieving value for key ${key}:`, error);
      throw error;
    }
  };
  


export const set = async (key, value, ttlInSeconds) => {
  try {
    await redisClient.set(key, value, {
      EX: ttlInSeconds,
      NX: true,
    });
    console.log(`Key ${key} set successfully`);
  } catch (error) {
    console.error(`Error setting key ${key}:`, error);
    throw error;
  }
};

export const del = async (key) => {
  try {
    await redisClient.del(key);
    console.log(`Key ${key} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting key ${key}:`, error);
    throw error;
  }
};



export const getJSON = async (key) => {
  try {
    const jsonData = await redisClient.json.get(key);
    return jsonData;
  } catch (error) {
    console.error("Error retrieving JSON from Redis:", error);
    throw error;
  }
};

export const delJSON = async (key) => {
  try {
    const result = await redisClient.json.del(key, ".");
    if (result === 1) {
      console.log(`JSON data with key '${key}' deleted successfully.`);

      return { statusCode: 200, message: "JSON data deleted successfully." };
    } else {
      console.log(`No JSON data found with key '${key}'.`);

      return {
        statusCode: 404,
        message: "No JSON data found with the provided key.",
      };
    }
  } catch (error) {
    console.error(
      `Failed to delete JSON data with key '${key}' due to error: ${error}`
    );

    return {
      statusCode: 500,
      message: "Operation failed.",
      errorDetails: error.message,
    };
  }
};

export const setJSON = async (key, data, ttl) => {
  try {
    await redisClient.json.set(key, ".", data);
    await redisClient.expire(key, ttl);

    console.log(
      `JSON data set with key '${key}' and TTL ${ttl} seconds successfully.`
    );

    return { statusCode: 200, message: "JSON data set successfully." };
  } catch (error) {
    console.error(
      `Failed to set JSON data with key '${key}' and TTL ${ttl} seconds due to error: ${error}`
    );

    return {
      statusCode: 500,
      message: "Operation failed.",
      errorDetails: error.message,
    };
  }
};
