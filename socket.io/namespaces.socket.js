const NamespaceModel = require("../models/Namespace");
const UserModel = require("./../models/User");
const path = require("path");
const fs = require("fs");
const { Z_ASCII } = require("zlib");

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
			let mainNamespace = await NamespaceModel.findById(
				namespace._id
			).lean();

			socket.emit("namespaceRooms", mainNamespace.rooms);

			getMessages(socket, io);
			getMedia(socket, io);

			socket.on("joining", async (newRoom) => {
				mainNamespace = await NamespaceModel.findById(namespace._id);

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

const getMessages = (socket, io) => {
	socket.on("newMsg", async (data) => {
		const { message, roomName, senderID } = data;
		const sender = await UserModel.findById(senderID);

		const namespace = await NamespaceModel.findOne({
			"rooms.title": roomName,
		});

		await NamespaceModel.findOneAndUpdate(
			{ _id: namespace._id, "rooms.title": roomName },
			{
				$push: {
					"rooms.$.messages": {
						sender: sender._id,
						message,
					},
				},
			}
		);

		io.of(namespace.href)
			.in(roomName)
			.emit("confirmMsg", { message, sender });
	});

	detectIsTyping(socket, io);
};

const detectIsTyping = (socket, io) => {
	socket.on("isTyping", async (data) => {
		const { userID, roomName, isTyping } = data;

		const namespace = await NamespaceModel.findOne({
			"rooms.title": roomName,
		});
		const user = await UserModel.findById(userID);

		io.of(namespace.href)
			.in(roomName)
			.emit("isTyping", { isTyping, username: user.username });

		if (!isTyping) getRoomOnlineUsers(io, namespace.href, roomName);
	});
};

const getMedia = (socket, io) => {
	socket.on("newMedia", async (data) => {
		const { filename, file, senderID, roomName } = data;
		const namespace = await NamespaceModel.findOne({
			"rooms.title": roomName,
		});
		const sender = await UserModel.findById(senderID);

		const ext = path.extname(filename);
		const mediaPath = `/uploads/${String(Date.now() + ext)}`;

		fs.writeFile(`public/${mediaPath}`, file, async (err) => {
			if (!err) {
				await NamespaceModel.findOneAndUpdate(
					{ _id: namespace._id, "rooms.title": roomName },
					{
						$push: {
							"rooms.$.medias": {
								sender,
								path: mediaPath,
							},
						},
					}
				);
				io.of(namespace.href)
					.in(roomName)
					.emit("confirmMedia", { sender, message });
			}
		});
	});
};
