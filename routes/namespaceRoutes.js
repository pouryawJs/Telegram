const express = require("express");
const NamespaceController = require("./../controllers/namespaceController");
const { multerStorage } = require("./../middlewares/multer");

const router = express.Router();

const uploader = multerStorage("public/rooms");

router.get("/", NamespaceController.getAll);
router.post("/", NamespaceController.create);
router.post("/rooms", uploader.single("media"), NamespaceController.createRoom);

module.exports = router;
