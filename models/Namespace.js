const mongoose = require("mongoose");

const namespaceSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		href: { type: String, required: true },
		rooms: [{ type: mongoose.Types.ObjectId, ref: "Room" }],
	},
	{ timestamps: true, versionKey: false }
);

const model = mongoose.model("Namespace", namespaceSchema);

module.exports = model;
