const express = require("express");
const { engine } = require("express-handlebars");
const multer = require("multer");
const upload = multer();
const path = require("path");

const key =
  "live_PllfhM4oZMM6X1C5s3T2igPjPMBTiKfBEElnckSxHwcxMoGU17lzJFcCmHHyUFWc";

const port = process.env.port || 3000;
const app = express();

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.set(express.json());

app.use(express.static("public"));

/* Insert middleware here */

app.get("/document", (req, res, next) => {
  console.log("Opening document page.");
  res.status(200).render("documentPage", {
    title: "Untitled",
    content: "",
  });
});

app.post("/document", upload.single("file"), (req, res, next) => {
  console.log("Opening user document.");

  const file = req.file;
  const title = path.parse(file.originalname).name;
  const content = file.buffer.toString();

  const input = { title, content };

  // very important, vital functionality
  if (title == "give me a kitty") {
    console.log("cat zone");

    fetch("https://api.thecatapi.com/v1/images/search", {
      headers: {
        "x-api-key": key,
      },
    })
      .then((value) => value.json())
      .then(([data]) => {
        res.status(200).render("documentPage", {
          important: true,
          src: data.url,
          width: data.width,
          height: data.height,
          ...input,
        });
      })
      .catch((err) =>
        res.status(200).render("documentPage", {
          important_err: true,
          ...input,
        })
      );
  } else {
    res.status(200).render("documentPage", input);
  }
});

app.get("/selectFile", (req, res, next) => {
  console.log("Opening selectFile page.");
  res.status(200).render("selectFilePage");
});

app.get("/", (req, res, next) => {
  console.log("Opening home page.");
  res.status(200).render("homePage");
});

app.get("*", (req, res, next) => {
  console.log(`'${req.path}' requested but does not exist.`);
  res.status(404).render("404Page");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
});
