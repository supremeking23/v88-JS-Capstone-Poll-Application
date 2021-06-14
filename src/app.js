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

const redis = require("redis");
const client = redis.createClient(6379); //port number is optional

// client.on("connect", function () {
// 	console.log("Connected to Redis...students");
// });

// client.on("error", function (error) {
// 	console.error(error);
// });

io.on("connection", function (socket) {
	console.log(`a user is connected`);

	socket.on("start-collecting-data", function (data) {
		console.log(data.message);

		socket.broadcast.emit("start-collecting-data-response", { message: "start collecting data response" });
	});

	socket.on("stop-collecting-data", function (data) {
		socket.broadcast.emit("stop-collecting-data-response", { message: "stop collecting data response" });
	});

	// let number_of_students = 0;
	socket.on("student-enter-the-poll", function (data) {
		// number_of_students = number_of_students + 1;
		// console.log(data.message);

		client.exists("number_of_students", async (err, result) => {
			if (result == 0) {
				client.hmset("number_of_students", ["students", 0], (err, result) => {});
				client.expire("user_session", 1200); ///expire in 2hrs
			}

			client.hgetall("number_of_students", async (err, obj) => {
				// console.log("hi from nunber");

				let number_of_students = parseInt(obj.students) + 1;
				client.hmset("number_of_students", ["students", number_of_students], (err, result) => {
					client.hgetall("number_of_students", async (err, obj) => {
						// let number_of_students = parseInt(obj.students) + 1;
						console.log(obj);
						console.log(number_of_students);

						socket.broadcast.emit("student-enter-the-poll-response", { number_of_students: obj.students });
					});
				});
			});
		});
	});

	socket.on("send-poll-answer", function (data) {
		console.log(data);
		socket.broadcast.emit("update-poll-data", { message: "update poll data" });
	});

	// let number_of_students = [];
	// socket.on("student-enter-the-poll", function (data) {
	// 	// number_of_students = number_of_students + 1;
	// 	number_of_students.push(1);
	// 	let n_student = number_of_students.length;
	// 	console.log(data.message);
	// 	console.log(number_of_students);
	// 	socket.broadcast.emit("student-enter-the-poll-response", { number_of_students: n_student });
	// });

	socket.on("disconnect", function () {
		console.log(`a user is disconnected`);

		// client.exists("number_of_students", async (err, result) => {
		// 	// if (result == 0) {
		// 	// 	client.hmset("number_of_students", ["students", 0], (err, result) => {});
		// 	// }

		// 	client.hgetall("number_of_students", async (err, obj) => {
		// 		// console.log("hi from nunber");

		// 		let number_of_students = parseInt(obj.students) - 1;
		// 		client.hmset("number_of_students", ["students", number_of_students], (err, result) => {
		// 			client.hgetall("number_of_students", async (err, obj) => {
		// 				// let number_of_students = parseInt(obj.students) + 1;
		// 				console.log(obj);
		// 				console.log(number_of_students);

		// 				socket.broadcast.emit("student-enter-the-poll-response", { number_of_students: obj.students });
		// 			});
		// 		});
		// 	});
		// });

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
