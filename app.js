const express = require("express");

const namespaceRoutes = require("./routes/namespaceRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/namespaces", namespaceRoutes);

module.exports = app;
