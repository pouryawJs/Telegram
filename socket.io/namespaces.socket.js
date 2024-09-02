const NamespaceModel = require("../models/Chat");

exports.initConnection = (io) => {
    io.on("connection", async (socket) => {
        const namespaces = await NamespaceModel.find({}).sort({ _id: -1 });
        socket.emit("namespaces", namespaces);
    });
};
exports.getNamespacesRooms = async (io) => {
    const namespaces = await NamespaceModel.find({}).lean();

    namespaces.forEach((namespace) => {
        io.of(namespace.href).on("connection", (socket) => {
            socket.emit("namespaceRooms", namespace.rooms);

            socket.on("joining", (roomTitle) => {
                const joinedRoom = Array.from(socket.rooms)[1];

                if (joinedRoom) {
                    socket.leave(joinedRoom);
                }
                socket.join(roomTitle);

                const roomInfo = namespace.rooms.find(
                    (room) => room.title === roomTitle
                );
                socket.emit("roomInfo", roomInfo);
            });
        });
    });
};
