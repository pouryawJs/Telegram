const express = require("express");
const namespaceController = require("../controllers/namespaceController.js");
const router = express.Router();

router.get("/", namespaceController.getAll);
router.post("/", namespaceController.create);

router.post("/rooms", namespaceController.createRoom);

module.exports = router;
