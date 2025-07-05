const { initConnection, getNameSpacesRooms } = require("./namespaces.socket");

exports.socketHandler = (io) => {
	initConnection(io);
	getNameSpacesRooms(io);
};
