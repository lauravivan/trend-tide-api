import mongoose from "mongoose";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fmeitb9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

function connectBD() {
  return mongoose.connect(uri);
}

export default connectBD;
