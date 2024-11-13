const dbHandler = require('../testSetup');

beforeAll(async () => {
  await dbHandler.setUp();
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
});

afterEach(async () => {
  await dbHandler.dropCollections();
});

afterAll(async () => {
  await dbHandler.tearDown();
}); 