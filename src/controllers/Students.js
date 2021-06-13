const redis = require("redis");
const client = redis.createClient(6379); //port number is optional

client.on("connect", function () {
	console.log("Connected to Redis...students");
});

client.on("error", function (error) {
	console.error(error);
});

class Students {
	poll_view(req, res) {
		console.log("from poll view");
		client.exists("poll_question", async (err, result) => {
			if (result == 0) {
				res.redirect("/");
				return false;
			}
			client.hgetall("poll_question", async (err, obj) => {
				console.log(obj);
				let list = JSON.parse(obj.choices);

				let choice_list = [];
				for (let i = 0; i < list.length; i++) {
					// console.log(list[i].choice);
					choice_list.push({
						vote: list[i].vote,
						choice: list[i].choice,
					});
				}
				console.log(choice_list);
				// res.render("teachers/response_data", { question: obj.question, response_list });
				res.render("students/poll_view", { question: obj.question, choice_list });
			});
		});

		// res.render("students/poll_view");
	}

	// process
	submit_response_process(req, res) {
		client.exists("poll_question", async (err, result) => {
			if (result == 0) {
				// res.redirect("/teacher_create_poll");
				return false;
			}
			client.hgetall("poll_question", async (err, obj) => {
				console.log(obj);
				let list = JSON.parse(obj.choices);
				for (let i = 0; i < list.length; i++) {
					// console.log(list[i].choice);
					if (list[i].choice == req.body.choice) {
						list[i].vote = list[i].vote + 1;
					}
				}

				client.hmset("poll_question", ["choices", JSON.stringify(list)], (err, result) => {
					console.log(`here are the results ${result}`);
				});
				console.log(list);
				console.log(req.body);
				res.redirect("student_response_view");
			});
		});
	}

	student_response_view(req, res) {
		client.exists("poll_question", async (err, result) => {
			if (result == 0) {
				// res.redirect("/teacher_create_poll");
				return false;
			}
			client.hgetall("poll_question", async (err, obj) => {
				res.render("students/student_response_view", { question: obj.question });
			});
		});
	}
}

module.exports = Students;
