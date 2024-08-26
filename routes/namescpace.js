const express = require("express");
const namespaceController = require("../controllers/namescpace");
const { multerStorage } = require("../middlewares/multer");

const router = express.Router();

const uploader = multerStorage("public/rooms");
router.get("/", namespaceController.getAll);
router.post("/", namespaceController.create);
router.post("/room", uploader.single("media"), namespaceController.createRoom);

module.exports = router;
