const express = require("express");
const mongoose = require("mongoose");
const mainRouter = require("./routes/index");

const app = express();
const { PORT = 3001 } = process.env;

mongoose.set("strictQuery", true);

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // console.log("Connected to DB");
  })
  .catch(console.error);

app.use(express.json());
app.use("/", mainRouter);

app.use((req, res, next) => {
  req.user = {
    _id: "672d70cb4d73bd1a216917ea", // paste the _id of the test user created in the previous step
  };
  next();
});

app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
});
