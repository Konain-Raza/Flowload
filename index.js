const express = require("express");
const routes = require("./routes/downloadRoutes.js");
const cors = require("cors");
const app = express();
const path = require("path");
const favicon = require('serve-favicon');
const PORT = 3000;

app.use(cors());
// app.use(favicon(path.join(__dirname, '../views/public', 'icon.ico')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/api", routes);

//for development
// app.listen(3000, () => console.log(`🚀 FlowLoad API running on port ${PORT}`));
// 
//for production
export default app;
