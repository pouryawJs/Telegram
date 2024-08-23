const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            require: true,
        },
        message: {
            type: String,
        },
    },
    { versionKey: false, timestamps: true }
);

const roomSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        messages: { type: [messageSchema], default: [] },
    },
    { versionKey: false, timestamps: true }
);

const namespaceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        href: {
            type: String,
            required: true,
        },
        rooms: { type: [roomSchema], default: [] },
    },
    { versionKey: false }
);

const namespaceModel = mongoose.model("Chat", namespaceSchema);

module.exports = namespaceModel;
