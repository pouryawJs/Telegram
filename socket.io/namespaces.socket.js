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
				if (lastRoom) {
					socket.leave(lastRoom);
					await getRoomOnlineUsers(io, mainNamespace.href, lastRoom);
				}

				socket.join(newRoom);
				await getRoomOnlineUsers(io, mainNamespace.href, newRoom);
				const newRoomInfo = mainNamespace.rooms.find(
					(room) => room.title === newRoom
				);
				socket.emit("roomInfo", newRoomInfo);

				socket.on("disconnect", async () => {
					await getRoomOnlineUsers(io, mainNamespace.href, newRoom);
				});
			});
		});
	});
};

const getRoomOnlineUsers = async (io, href, room) => {
	const onlienUsers = await io.of(href).in(room).allSockets();
	io.of(href)
		.in(room)
		.emit("onlineUsersCount", Array.from(onlienUsers).length);
};
