const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
var cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const keys = require("./config/keys");

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then(user => {
		done(null, user);
	});
});

const app = express();

var corsOptions = {
	origin: [
		"http://localhost:3000",
		"https://reactjs.datasoft.com.ua"
	],
	optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(
	expressSession({
		secret: keys.sessionSecret,
		resave: true,
		saveUninitialized: true
	})
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());

// Load routes
const auth = require("./routes/auth");
const user = require("./routes/user");

require("./passport");

// Connect to mongoose
mongoose
	.connect(keys.mongoURI)
	.then(() => console.log("MongoDB Connected."))
	.catch(err => console.log(err));

app.use("/auth", auth);
app.use("/user", passport.authenticate("jwt", { session: false }), user);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
