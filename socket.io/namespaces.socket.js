const NamespaceModel = require("./../models/Chat");

exports.initConnection = (io) => {
	io.on(`connection`, async (socket) => {
		const namespaces = await NamespaceModel.find({}).sort({ _id: -1 });
		socket.emit(`namespaces`, namespaces);
	});
};

exports.getNameSpacesRooms = async (io) => {
	const namespaces = await NamespaceModel.find({}).lean();

	namespaces.forEach((namespace) => {
		io.of(namespace.href).on("connection", async (socket) => {
			const mainNamespace = await NamespaceModel.findById(namespace._id);

			socket.emit("namespaceRooms", mainNamespace.rooms);

			socket.on("joining", async (newRoom) => {
				const lastRoom = Array.from(socket.rooms)[1];
				console.log(socket.rooms);
				if (lastRoom) {
					socket.leave(lastRoom);
				}

				socket.join(newRoom);
				const newRoomInfo = mainNamespace.rooms.find(
					(room) => room.title === newRoom
				);
				socket.emit("roomInfo", newRoomInfo);
			});
		});
	});
};
