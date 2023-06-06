import mongoose from "mongoose";
import "dotenv/config";

mongoose.connect(process.env.MONGODB_CONNECT_STRING, {
  useNewUrlParser: true,
});

const db = mongoose.connection;

// Only exists to get unique IDs
const userCookieSchema = mongoose.Schema({});

const documentSchema = mongoose.Schema({
  userCookie: { type: mongoose.ObjectId, required: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
});

const UserCookie = mongoose.model("userCookie", userCookieSchema);
const Document = mongoose.model("Document", documentSchema);

export async function newCookie() {
  const cookie = new UserCookie();
  return await cookie.save();
}

async function readDocumentBlurbs(userCookie) {
  const query = Document.find({ userCookie }, "title _id");
  return await query.exec();
}

async function newDocument(userCookieStr, title, content) {
  const userCookie = new mongoose.Types.ObjectId(userCookieStr);

  const doc = new Document({
    userCookie,
    title,
    content,
  });
  return await doc.save();
}

async function readDocument(documentID) {
  const _id = new mongoose.Types.ObjectId(documentID);

  const query = Document.findOne({ _id });
  return await query.exec();
}

async function updateDocument(documentID, title, content) {
  return await Document.findOneAndUpdate(
    { _id: documentID },
    { title, content },
    {
      new: true,
    }
  );
}

export const DocumentModel = {
  blurbs: readDocumentBlurbs,
  new: newDocument,
  read: readDocument,
  update: updateDocument,
};

