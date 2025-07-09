const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		image: { type: String, required: true },
		messages: [{ type: mongoose.Types.ObjectId, ref: "Message" }],
		medias: [{ type: mongoose.Types.ObjectId, ref: "Media" }],
	},
	{ timestamps: true, versionKey: false }
);

const model = mongoose.model("Room", roomSchema);

module.exports = model;
