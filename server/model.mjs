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

export const CookieError = { Error: "Could not generate cookie" };
export const ReadError = { Error: "Could not read database" };
export const WriteError = { Error: "Could not write database" };
export const UpdateError = { Error: "Could not update database" };

export async function newCookie() {
  try {
    const cookie = new UserCookie();
    return await cookie.save();
  } catch (error) {
    throw CookieError;
  }
}

async function readDocumentBlurbs(userCookie) {
  try {
    const query = Document.find({ userCookie }, "title _id");
    return await query.exec();
  } catch (error) {
    throw ReadError;
  }
}

async function newDocument(userCookieStr, title, content) {
  try {
    const userCookie = new mongoose.Types.ObjectId(userCookieStr);

    const doc = new Document({
      userCookie,
      title,
      content,
    });
    return await doc.save();
  } catch (error) {
    throw WriteError;
  }
}

async function readDocument(documentID) {
  try {
    const _id = new mongoose.Types.ObjectId(documentID);

    const query = Document.findOne({ _id });
    return await query.exec();
  } catch (error) {
    throw ReadError;
  }
}

async function updateDocument(documentID, title, content) {
  try {
    return await Document.findOneAndUpdate(
      { _id: documentID },
      { title, content },
      {
        new: true,
      }
    );
  } catch (error) {
    throw UpdateError;
  }
}

export const DocumentModel = {
  blurbs: readDocumentBlurbs,
  new: newDocument,
  read: readDocument,
  update: updateDocument,
};
