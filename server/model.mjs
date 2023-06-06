import mongoose from "mongoose";
import "dotenv/config";

mongoose.connect(process.env.MONGODB_CONNECT_STRING, {
  useNewUrlParser: true,
});

const db = mongoose.connection;

const documentSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

export const Document = mongoose.model("Document", documentSchema);
