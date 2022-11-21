const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const orderRoutes = require("./routes/orderRoutes.js");
const sequelize = require("./src/models/dbConfig");

const app = express();
app.use(bodyParser.json());

app
  .use(morgan("dev"))
  .use("/api/mini", orderRoutes)

  //errors management
  .use(({ res }) => {
    res.status(404).json({ message: "Sorry the page does not exist!" });
  });

sequelize.initDb();

app.listen(process.env.NODE_PORT || 3000, () =>
  console.log(`server started: http://localhost:${process.env.NODE_PORT}`)
);
