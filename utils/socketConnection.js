const socketIO = require("socket.io");

module.exports = (httpsever) => {
    const io = socketIO(httpsever, {
        cors: {
            origin: "*",
        },
    });

    return io;
};
