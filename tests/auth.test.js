const request = require('supertest');
const app = require('../server');
let server;

beforeAll(async () => {
  // Connect to test database
  await connectToDatabase();
});

afterAll(async () => {
  // Close the server and database connection after tests
  await mongoose.connection.close();
  if (server) server.close();
});

// ... rest of your test code ... 