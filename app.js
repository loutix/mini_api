const bodyParser = require("body-parser");
const express = require("express");
const morgan = require("morgan");
const orderRoutes = require("./routes/routes");
const sequelize = require("./config/dbConfig");
const app = express();

const port = process.env.PORT || 5500;

app.use(bodyParser.json());

app.get("/loic", (req, res) => {
  res.json("hello, loïc");
});

app
  .use(morgan("dev"))
  .use("/api/mini", orderRoutes)

  //errors management
  .use(({ res }) => {
    res.status(404).json({ message: "Sorry the page does not exist!" });
  });

sequelize.initDb();

app.listen(port, () => console.log(`server started: http://localhost:${port}`));
