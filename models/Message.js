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

const model = mongoose.model("Message", messageSchema);

module.exports = model;
