const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

console.log('MONGODB_URI:', process.env.MONGODB_URI); // Add this line

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not defined in the environment variables');
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
    db = client.db("school_db"); // Replace with your database name
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

function getDb() {
  return db;
}

module.exports = { connectToDatabase, getDb, client };
