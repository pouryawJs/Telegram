const express = require("express");
const path = require("path");
const cors = require("cors");
const namespaceRoutes = require("./routes/namespaceRoutes");
const authRoutes = require("./routes/User.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/namespaces", namespaceRoutes);
app.use("/api/auth", authRoutes);

module.exports = app;
