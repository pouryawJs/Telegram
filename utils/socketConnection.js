const socketIO = require("socket.io");

module.exports = (server) => {
	const io = socketIO(server, {
		cors: {
			origin: "*",
		},
	});

	return io;
};
