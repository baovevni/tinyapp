const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  abc1A: {
    id: "abc",
    email: "user@example.com",// ebarducov@gmail.com
    password: "purple-monkey-dinosaur",
  },
  def2B: {
    id: "def",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const id = Math.random().toString(36).slice(2, 8);

  const newUser = {
    id,
    email,
    password
  }

  for (const userId in users){
    if (users[userId].email !== email) {
      users[id] = newUser;
      res.cookie('user_id', id);
      res.redirect("/urls");
    } else {
      return res.status(403).send('Email already exist');
    }
  }
});

app.post("/login", (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body
  for (const userId in users) { // Iterate over the users object
    if (users[userId].email === email) { // Check credentials
      res.cookie('user_id', userId);
      
      return res.redirect("/urls");
    }
  }
  return res.status(403).send('Email or password is incorrect');
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId] || null;
  const templateVars = {
    user: user,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId] || null;

  const templateVars = { user: user }
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // this will log POST request to the console
  const shortURL = Math.random().toString(36).slice(2, 8);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id]) {
    res.status(404).send(`${id} does not exist`);
    return;
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log(users);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening at port ${PORT}!`);
});

