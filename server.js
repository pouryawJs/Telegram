const { default: mongoose } = require("mongoose");
const app = require("./app");
require("dotenv").config();

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

	app.listen(port, () => {
		console.log(`Server is Running On port ${port}`);
	});
};

const run = async () => {
	await connecctToDB();
	start();
};

run();
