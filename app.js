const express = require("express");
const path = require("path");
const namespaceRoutes = require("./routes/namespaceRoutes");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/namespaces", namespaceRoutes);

module.exports = app;
