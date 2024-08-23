const { default: mongoose } = require("mongoose");
const app = require("./app");
const dotenv = require("dotenv");
dotenv.config();

//* Database Connection
const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.log(`Error Connection To MongoDB: ${err}`);
    process.exit(1);
  }
};

//* Start app
const startServer = () => {
  const port = process.env.PORT || 4003;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

const run = async () => {
  await connectToDB();
  startServer();
};

run();
