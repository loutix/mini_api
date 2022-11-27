require("dotenv").config();
const sequelize = require("./config/dbConfig");
const app = require("./app");

sequelize.initDb();

const port = process.env.PORT || 5500;

app.listen(port, () =>
  console.log(`Server running on port ${port}, http://localhost:${port}`)
);
