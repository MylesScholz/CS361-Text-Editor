const express = require("express");
const { engine } = require("express-handlebars");

const port = process.env.port || 3000;
const app = express();

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.set(express.json());

app.use(express.static("src"));
app.use(express.static("public"));

/* Insert middleware here */

app.get("/", (req, res, next) => {
  console.log("Opening homepage");
  res.status(200).render("homePage");
});

app.get("*", (req, res, next) => {
  console.log(`'${req.path}' requested but does not exist.`);
  res.status(404).render("404Page");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
