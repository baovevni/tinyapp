const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const expect = chai.expect;

describe('Routes and Authentication', () => {
  const agent = chai.request.agent('http://localhost:8080'); // Create agent for session handling

  // Test for redirect to login page when accessing '/'
  it('should redirect to login page for access to root URL', async () => {
    const res = await agent.get('/');
    expect(res).to.redirectTo('http://localhost:8080/login');
  });

  // Test for redirect to login page when accessing '/urls/new'
  it('should redirect to login page for access to /urls/new', async () => {
    const res = await agent.get('/urls/new');
    expect(res).to.redirectTo('http://localhost:8080/login');
  });

  // Test for status code 404 when accessing a non-existent URL
  it('should return status code 404 for accessing a non-existent URL', async () => {

    await agent.post('/login')
    .send({
      email: 'user@example.com',
      password: '1234'
    });
    const res = await agent.get('/urls/NOTEXISTS');
    expect(res).to.have.status(404);
  });

  // Test for status code 403 when accessing a protected URL without login
  it('should return status code 403 for accessing a protected URL without login', async () => {
    await agent.post('/logout');
    const res = await agent.get('/urls/b2xVn2');
    expect(res).to.have.status(403);
  });

  // Test for status code 403 after successful login followed by accessing a protected URL
  it('should return status code 403 after successful login followed by accessing a protected URL', async () => {
    // Login with user2's credentials
    await agent.post('/login')
      .send({
        email: 'user2@example.com',
        password: 'dishwasher-funk'
      });

    // Attempt to access a protected URL
    const res = await agent.get('/urls/b2xVn2');
    expect(res).to.have.status(403);
  });

  after(() => {
    agent.close(); // Close agent after all tests are done
  });
});
