import express from "express";
import { engine } from "express-handlebars";
import multer from "multer";
import path from "path";
import asyncHandler from "express-async-handler";
import { newCookie, DocumentModel } from "./model.mjs";

const upload = multer();

const port = process.env.port || 3000;
const app = express();

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.set(express.json());

app.use(express.static("public"));

/* Insert middleware here */

app.get("/cookie", asyncHandler(async (req, res, next) => {
    const cookie = await newCookie();
    console.log(`generated new cookie: ${cookie}`);
    res.status(200).json(cookie);
  })
);

app.get("/document", asyncHandler(async (req, res, next) => {
  console.log("Opening document page.");

  const title = "Untitled"
  const content = ""

  const doc = await DocumentModel.new(req.query.userid, title, content);
  res.status(200).render("documentPage", { title, content, });
}));

app.post("/document", upload.single("file"), (req, res, next) => {
  console.log("Opening user document.");

  const file = req.file;
  const title = path.parse(file.originalname).name;
  const content = file.buffer.toString();

  const input = { title, content };
  res.status(200).render("documentPage", input);
});

app.get("/selectFile", asyncHandler(async (req, res, next) => {
  console.log("Opening selectFile page.");

  const data = await DocumentModel.blurbs(req.query.userid)
  const documents = data.map((item) => ({ id: item["_id"], title: item.title }))
  res.status(200).render("selectFilePage", { documents });
}));

app.get("/loadDocument", asyncHandler(async (req, res, next) => {
  console.log("Loading existing document.");

  const data = await DocumentModel.read(req.query.doc);
  console.log(data)

  res.status(200).render("documentPage", {
    title: data.title,
    content: data.content,
  })
}))

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
