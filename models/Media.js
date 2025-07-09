const mongoose = require("mongoose");

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

const model = mongoose.model("Media", mediaSchema);

module.exports = model;
