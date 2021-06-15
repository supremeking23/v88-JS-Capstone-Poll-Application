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
	socket.on("get_poll_application_session", function (data) {
		console.log(data);
		client.exists("poll_application_session", async (err, result) => {
			if (result == 0) {
				client.hmset("poll_application_session", ["start_collecting_response", false], (err, result) => {});
				client.expire("poll_application_session", 1200); ///expire in 2hrs
			}

			client.hgetall("poll_application_session", async (err, obj) => {
				console.log(obj);
				socket.emit("collecting_response_state", { state: obj.start_collecting_response });
			});

			client.exists("number_of_students", async (err, result) => {
				if (result == 0) {
					// client.hmset("number_of_students", ["students", 0], (err, result) => {});
					// client.expire("user_session", 1200); ///expire in 2hrs
				}

				// console.log("hi from nunber");
				client.hgetall("number_of_students", async (err, obj) => {
					// let number_of_students = parseInt(obj.students) + 1;
					console.log(obj);
					socket.emit("student-enter-the-poll-response", { number_of_students: obj.students });
					socket.broadcast.emit("student-enter-the-poll-response", { number_of_students: obj.students });
				});
				socket.emit("update-vote-count", { message: "update vote data" });
				socket.broadcast.emit("update-vote-count", { message: "update vote data" });
			});
		});
	});

	socket.on("start-collecting-data", function (data) {
		console.log(data.message);

		client.exists("poll_application_session", async (err, result) => {
			// if (result == 0) {
			// 	client.hmset("poll_application_session", ["start_collecting_response", true], (err, result) => {});
			// 	client.expire("poll_application_session", 1200); ///expire in 2hrs
			// }

			client.hmset("poll_application_session", ["start_collecting_response", true], (err, result) => {});
		});

		socket.broadcast.emit("start-collecting-data-response", { message: "start collecting data response" });
	});

	socket.on("stop-collecting-data", function (data) {
		client.exists("poll_application_session", async (err, result) => {
			if (result == 0) {
			}
			client.hmset("poll_application_session", ["start_collecting_response", false], (err, result) => {});
			client.hmset("number_of_students", ["students", 0], (err, result) => {});
			client.del("poll_question");
		});
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
		socket.broadcast.emit("update-vote-count", { message: "update vote data" });
		// client.exists("poll_question", (err, result) => {
		// 	if (result == 0) {

		// 		return false;
		// 	}
		// 	client.hgetall("poll_question", (err, obj) => {
		// 		console.log(obj);
		// 		let list = JSON.parse(obj.choices);

		// 		let total_vote = 0;
		// 		for (let i = 0; i < list.length; i++) {
		// 			// console.log(list[i].choice);
		// 			total_vote = total_vote + list[i].vote;
		// 		}

		// });
	});

	socket.on("disconnect", function () {});
});

// for image/js/css
app.use(EXPRESS.static(__dirname + "/assets"));
// This sets the location where express will look for the ejs views
app.set("views", __dirname + "/views");
// Now lets set the view engine itself so that express knows that we are using ejs as opposed to another templating engine like jade
app.set("view engine", "ejs");
// use app.get method and pass it the base route '/' and a callback

require("./routes.js")(app);
