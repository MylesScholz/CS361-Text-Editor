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
  content: { type: String, required: true },
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

async function newDocument(userCookie, title, content) {
  const doc = new Document({
    userCookie,
    title,
    content,
  });
  return await doc.save();
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
  update: updateDocument,
};

/*
async function test() {
  const cookie = await newCookie();
  console.log(`created: ${cookie}`);

  const doc = await newDocument(cookie, "untitled", "asdfasdf");
  console.log(`created: ${doc}`);

  const blurbs = await readDocumentBlurbs(cookie);
  console.log(`blurbs: ${blurbs}`);

  const update = await updateDocument(cookie, "titled", ";lkj;lkj");
  console.log(`updated doc: ${update}`);
}

test().catch((e) => console.log(e));
*/
