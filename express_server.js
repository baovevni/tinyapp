const express = require("express");
const app = express();
const PORT = 8080;
function generateRandomString(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.status(200).send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.status(200).json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.status(200).render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  res.status(200).render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body); // this will log POST request to the console
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.status(200).redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  // if (req.params.id !== urlDatabase.id){
  //   res.status(404).write(`${id} does not exist`);
  // }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.status(200).render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.status(200).redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening at port ${PORT}!`);
});

