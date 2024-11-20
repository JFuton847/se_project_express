const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");
const { login, createUser } = require("./controllers/users");
const cors = require("cors");

const app = express();
const { PORT = 3001 } = process.env;

mongoose.set("strictQuery", true);

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    // console.log("Connected to DB");
  })
  .catch(console.error);

app.use(express.json());

app.post("/signin", login);
app.post("/signup", createUser);

app.use("/", mainRouter);
app.use(cors());

app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
});
