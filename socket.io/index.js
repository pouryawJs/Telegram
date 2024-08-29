const { initConnection, getNamespacesRooms } = require("./namespaces.socket");

const socketHandler = (io) => {
    initConnection(io);
    getNamespacesRooms(io);
};
module.exports = socketHandler;
