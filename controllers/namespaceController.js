const NamespaceModel = require("./../models/Chat");

exports.getAll = async (req, res, next) => {
	try {
		const namespaces = await NamespaceModel.find({}, { rooms: 0 });
		return res.json({ namespaces });
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
				.json({ message: "This title or href has been used" });
		}

		await NamespaceModel.create({ title, href });
		return res
			.status(201)
			.json({ message: "new namespace created successfully" });
	} catch (err) {
		next(err);
	}
};

exports.createRoom = async (req, res, next) => {
	try {
		const { title, namespace } = req.body;

		const mainNamespace = await NamespaceModel.findOne({
			title: namespace,
		});

		if (!mainNamespace) {
			return res.status(404).json({ message: "namespace not found" });
		}

		const mainRoom = await NamespaceModel.findOne({ "rooms.title": title });

		if (mainRoom) {
			return res
				.status(400)
				.json({ message: "room has been created before" });
		}
		const room = { title, image: "sds122" };

		await NamespaceModel.findOneAndUpdate(
			{ title: namespace },
			{ $push: { rooms: room } }
		);

		return res
			.status(201)
			.json({ message: "new Room created successfully" });
	} catch (err) {
		next(err);
	}
};
