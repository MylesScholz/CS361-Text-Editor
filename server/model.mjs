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

// Various error types
export const CookieError = { Error: "Could not generate cookie" };
export const ReadError = { Error: "Could not read database" };
export const WriteError = { Error: "Could not write database" };
export const UpdateError = { Error: "Could not update database" };

/**
 * Creates a new cookie and returns it
 *
 * @returns {ObjectId} the cookie
 *
 * @throws CookieError
 */
export async function newCookie() {
  try {
    const cookie = new UserCookie();
    return await cookie.save();
  } catch (error) {
    throw CookieError;
  }
}

/**
 * Reads all documents associated with the user, and returns their titles and
 * ids.
 *
 * @param {ObjectId} userCookie the user's ID cookie
 *
 * @returns { [{ _id: string, title: string }] }
 *
 * @throws ReadError
 */
async function readDocumentBlurbs(userCookie) {
  try {
    const query = Document.find({ userCookie }, "title _id");
    return await query.exec();
  } catch (error) {
    throw ReadError;
  }
}

/**
 * Creates a new document
 *
 * @param {string} userCookieStr the user's ID cookie (in string form)
 * @param {string} title the title
 * @param {string} content the content
 *
 * @returns {{ _id: ObjectId, title: string, content: string }}
 *
 * @throws WriteError
 */
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

/**
 * Reads a document
 *
 * @param {string} documentID the documentID (in string form)
 *
 * @returns {{ _id: ObjectId, title: string, content: string }}
 */
async function readDocument(documentID) {
  try {
    const _id = new mongoose.Types.ObjectId(documentID);

    const query = Document.findOne({ _id });
    return await query.exec();
  } catch (error) {
    throw ReadError;
  }
}

/**
 * Updates a document
 *
 * @param {string} documentID the id of the document
 * @param {string} title the new document title
 * @param {string} content the new document content
 */
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

// export "namespace"
export const DocumentModel = {
  blurbs: readDocumentBlurbs,
  new: newDocument,
  read: readDocument,
  update: updateDocument,
};
