const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true, versionKey: false }
);

const mediaSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Types.ObjectId,
			ref: "User",
			required: true,
		},
		path: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true, versionKey: false }
);
const roomSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		image: { type: String, required: true },
		messages: {
			type: [messageSchema],
			default: [],
		},
		medias: {
			type: [mediaSchema],
			default: [],
		},
	},
	{ timestamps: true, versionKey: false }
);

const namespaceSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		href: { type: String, required: true },
		rooms: {
			type: [roomSchema],
			default: [],
		},
	},
	{ timestamps: true, versionKey: false }
);

const model = mongoose.model("Namespace", namespaceSchema);

module.exports = model;
