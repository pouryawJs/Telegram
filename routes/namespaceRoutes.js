const express = require("express");
const namespaceController = require("./../controllers/namespaceController.js");
const router = express.Router();

router.get("/", namespaceController.getAll);
router.post("/", namespaceController.create);

module.exports = router;
