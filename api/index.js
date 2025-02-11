const express = require("express");
const routes = require("../routes/downloadRoutes.js");
const cors = require("cors");
const app = express();
const path = require("path");
const PORT = 3000;

app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/api", routes);

//for development
// app.listen(PORT, () => console.log(`🚀 FlowLoad API running on port ${PORT}`));

//for production
export default app;
