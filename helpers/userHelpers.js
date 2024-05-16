const bcrypt = require("bcryptjs");

const fetchUrlsForUser = (userId, urlDatabase) => {
  let userUrls = {};

  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userId === userId) {
      userUrls[urlId] = urlDatabase[urlId].longURL;
    }
  }
  return userUrls;
};

const fetchUserByEmail = (email, users) => {
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId]; // Return the whole user object if found
    }
  }
  return null; // Return null if user is not found
};

const fetchUserById = (id, users) => {
  const user = users[id]
  if (user)  {
    return user  // Return the whole user object if found
  }
return null; // Return null if user is not found
};

const createUser = (email, password, users) => {
  const user = fetchUserByEmail(email, users);
  if (user) {
    return null; // Indicates user already exists.
  }

  const id = Math.random().toString(36).slice(2, 8);
  const newUser = {
    id,
    email,
    password,
  };

  users[id] = newUser; // Adds the new user to the users object
  return newUser; // Return the new user object
};

const authenticateUser = (email, password, users) => {
  const user = fetchUserByEmail(email, users);

  // Check if the user exists
  if (!user) {
    return { error: "User not found", user: null };
  }

  // Check if the password matches
  const result = bcrypt.compareSync(password, user.password);

  if (!result) {
    return { error: "Email or password is incorrect", user: null };
  }

  return { error: null, user };
};

module.exports = { fetchUrlsForUser, fetchUserByEmail, createUser, authenticateUser, fetchUserById };