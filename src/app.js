const EXPRESS = require("express");
const app = EXPRESS();
const PORT = 9000;

const server = app.listen(PORT, (req, res) => {
	console.log(`server is listening to port ${PORT}`);
});
const io = require("socket.io")(server);

let bodyParser = require("body-parser");
let session = require("express-session");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: true,
		cookie: { maxAge: 600000 },
	})
);

io.on("connection", function (socket) {
	console.log(`a user is connected`);

	socket.on("start-collecting-data", function (data) {
		console.log(data.message);

		socket.broadcast.emit("start-collecting-data-response", { message: "start collecting data response" });
	});

	socket.on("stop-collecting-data", function (data) {
		socket.broadcast.emit("stop-collecting-data-response", { message: "stop collecting data response" });
	});

	socket.on("disconnect", function () {
		console.log(`a user is disconnected`);

		// users = [];
	});
});

// for image/js/css
app.use(EXPRESS.static(__dirname + "/assets"));
// This sets the location where express will look for the ejs views
app.set("views", __dirname + "/views");
// Now lets set the view engine itself so that express knows that we are using ejs as opposed to another templating engine like jade
app.set("view engine", "ejs");
// use app.get method and pass it the base route '/' and a callback

require("./routes.js")(app);
