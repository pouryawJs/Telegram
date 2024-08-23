const express = require("express");
const namespaceRouter = require("./routes/namescpace");

const app = express();

//* BodyParser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
//* CORS Policy

//* Template Engine

//* Routes
app.use("/namespace", namespaceRouter);
//* 404 Error handler

module.exports = app;
