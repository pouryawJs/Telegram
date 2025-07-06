const jwt = require("jsonwebtoken");
const UserModel = require("./../models/User");

exports.auth = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		let user = await UserModel.findOne({ username, password });
		let statusCode = 200;
		console.log(user);
		if (!user) {
			user = await UserModel.create({ username, password });
			statusCode = 201;
		}

		const token = jwt.sign(
			{ _id: user._id },
			process.env.ACCESS_TOKEN_KEY,
			{
				expiresIn: "2d",
			}
		);

		// res.cookie("token", token, {
		//   httpOnly: true,
		//   signed: true,
		//   maxage: 1000 * 60 * 15,
		// });

		return res.status(statusCode).json({
			message: "User authenticated successfully",
			token,
		});
	} catch (err) {
		next(err);
	}
};

exports.me = async (req, res, next) => {
	try {
		// Codes
	} catch (err) {
		next(err);
	}
};
