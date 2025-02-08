const express = require("express");
const routes = require("./routes/downloadRoutes.js");
const cors = require("cors")
const app = express();
const PORT = 3000;

app.use(cors());
app.get("/", (req, res) => {
  res.send("Welcome to FlowLoad API");
});

app.use("/api", routes);

//for development
// app.listen(PORT, () => console.log(`🚀 FlowLoad API running on port ${PORT}`));

//for production
export default app;