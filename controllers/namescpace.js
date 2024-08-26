const NamespaceModel = require("../models/Chat");

exports.getAll = async (req, res, next) => {
    try {
        const namespaces = await NamespaceModel.find({}, { rooms: 0 });
        return res.json(namespaces);
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { title, href } = req.body;

        const namespace = await NamespaceModel.findOne({
            $or: [{ title }, { href }],
        });

        if (namespace) {
            return res
                .status(400)
                .json("namespace already exist with this info");
        }

        await NamespaceModel.create({ title, href });

        return res.status(201).json("namespace created successfully");
    } catch (err) {
        next(err);
    }
};

exports.createRoom = async (req, res, next) => {
    try {
        const { title, namespace } = req.body;
        let image = null;

        if (req.file) {
            image = `rooms/${req.file.filename}`;
        }
        const mainNamespace = await NamespaceModel.findOne({
            href: namespace,
        });

        if (!mainNamespace) {
            return res.status(404).json("namespace not found");
        }

        const mainRoom = await NamespaceModel.findOne({ "rooms.title": title });

        if (mainRoom) {
            return res.status(400).json("Room already exist");
        }
        const room = {
            title,
            image: image ? image : undefined,
        };

        await NamespaceModel.findOneAndUpdate(
            { href: namespace },
            {
                $push: { rooms: room },
            }
        );

        return res.status(201).json("room created successfully");
    } catch (err) {
        next(err);
    }
};
