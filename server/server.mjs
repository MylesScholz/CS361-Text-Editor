import express from "express";
import { engine } from "express-handlebars";
import multer from "multer";
import path from "path";
import asyncHandler from "express-async-handler";
import { newCookie, DocumentModel, ReadError } from "./model.mjs";

const upload = multer();

const port = process.env.port || 3000;
const app = express();

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(express.json());

app.use(express.static("public"));

/* Insert middleware here */

/**
 * Generates a new user id cookie and returns it as { _id: COOKIE }.
 */
app.get(
  "/cookie",
  asyncHandler(async (req, res, next) => {
    const cookie = await newCookie();
    console.log(`generated new cookie: ${cookie}`);
    res.status(200).json(cookie);
  })
);

/**
 * Creates a new document on the server.
 */
app.post(
  "/document/new",
  asyncHandler(async (req, res, next) => {
    console.log("Creating new document page.");

    const title = "Untitled";
    const content = "";

    const doc = await DocumentModel.new(req.query.userid, title, content);
    res.status(200).json({
      docid: doc._id,
    });
  })
);

/**
 * Recieves a file from the user, uploads it to the server, and renders it
 */
app.post(
  "/document/upload",
  upload.single("file"),
  asyncHandler(async (req, res, next) => {
    console.log("Uploading document.");

    const file = req.file;
    const title = path.parse(file.originalname).name;
    const content = file.buffer.toString();

    const doc = await DocumentModel.new(req.query.userid, title, content);
    res.redirect(`/document?docid=${doc.id}`);
  })
);

/**
 * Saves an existing file to the database.
 */
app.post(
  "/document/backup",
  asyncHandler(async (req, res, next) => {
    const docid = req.query.docid;
    const title = req.body.title;
    const content = req.body.content;

    console.log(`backing up user document "${req.query.docid}"`);

    await DocumentModel.update(docid, title, content);

    res.status(200).send();
  })
);

/**
 * Gets an existing document using its id.
 */
app.get(
  "/document",
  asyncHandler(async (req, res, next) => {
    console.log("Loading existing document.");

    console.log(`docid: ${req.query.docid}`);

    try {
      const data = await DocumentModel.read(req.query.docid);

      console.log(data);

      res.status(200).render("documentPage", {
        docid: data._id,
        title: data.title,
        content: data.content,
      });
    } catch (error) {
      if (error === ReadError) {
        console.log(`${req.query.docid} requested, but does not exist`);
        res.status(404).render("404Page");
      }
    }
  })
);

/**
 * Gets the selectFile page
 */
app.get(
  "/selectFile",
  asyncHandler(async (req, res, next) => {
    console.log("Opening selectFile page.");

    const data = await DocumentModel.blurbs(req.query.userid);
    const documents = data.map((item) => ({
      id: item["_id"],
      title: item.title,
    }));
    res.status(200).render("selectFilePage", { documents });
  })
);

/**
 * Gets the homepage
 */
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
