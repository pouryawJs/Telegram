const { initConnection } = require("./namespaces.socket");

const socketHandler = (io) => {
    initConnection(io);
};
modul.exports = socketHandler;
