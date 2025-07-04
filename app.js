const express = require("express");
const path = require("path");
const namespaceRoutes = require("./routes/namespaceRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// app.use(express.static(path.join(__dirname, "public")));

app.use("/api/namespaces", namespaceRoutes);

module.exports = app;
