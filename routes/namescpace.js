const express = require("express");
const namespaceController = require("../controllers/namescpace");

const router = express.Router();

router.get("/", namespaceController.getAll);
router.post("/", namespaceController.create);
router.post("/room", namespaceController.createRoom);

module.exports = router;
