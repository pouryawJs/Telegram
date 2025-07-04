const NamespaceModel = require("./../models/Chat");

exports.initConnection = (io) => {
	io.on(`connection`, async (socket) => {
		const namespaces = await NamespaceModel.find({}).sort({ _id: -1 });
		socket.emit(`namespaces`, namespaces);
	});
};
