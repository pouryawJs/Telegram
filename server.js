const { default: mongoose } = require("mongoose");
const http = require("http");
const app = require("./app");
require("dotenv").config();
const socketIoConnection = require("./utils/socketConnection");
const { initConnection } = require("./socket.io/namespaces.socket");

const connecctToDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log(`DB Connected Successfully: ${mongoose.connection.host}`);
	} catch (err) {
		console.log(`DB Error --> ${err}`);
		process.exit(1);
	}
};

const start = () => {
	const port = process.env.PORT || 4000;
	const server = http.createServer(app);

	//IO
	const io = socketIoConnection(server);
	initConnection(io);

	app.listen(port, () => {
		console.log(`Server is Running On port ${port}`);
	});
};

const run = async () => {
	await connecctToDB();
	start();
};

run();
