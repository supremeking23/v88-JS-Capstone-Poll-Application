const redis = require("redis");
const client = redis.createClient(6379); //port number is optional

client.on("connect", function () {
	console.log("Connected to Redis...teacher");
});

client.on("error", function (error) {
	console.error(error);
});

class Teachers {
	teacher_index(req, res) {
		res.render("teachers/teacher_index");
	}

	teacher_create_poll(req, res) {
		res.render("teachers/teacher_create_poll");
	}

	teacher_response_data(req, res) {
		client.exists("poll_question", async (err, result) => {
			if (result == 0) {
				res.redirect("/teacher_create_poll");
				return false;
			}
			client.hgetall("poll_question", async (err, obj) => {
				console.log(obj);
				let list = JSON.parse(obj.choices);

				let response_list = [];
				for (let i = 0; i < list.length; i++) {
					// console.log(list[i].choice);
					response_list.push({
						y: list[i].vote,
						label: list[i].choice,
					});
				}
				console.log(response_list);
				res.render("teachers/response_data", { question: obj.question, response_list });
			});
		});
	}

	// process
	create_poll_process(req, res) {
		let choices = [];
		for (let i = 0; i < req.body.choice.length; i++) {
			choices.push({
				choice: req.body.choice[i],
				vote: 0,
			});
		}
		client.hmset("poll_question", ["question", req.body.question, "choices", JSON.stringify(choices)], (err, result) => {
			console.log(`here are the results ${result}`);
		});

		client.expire("poll_question", 7200); ///expire in 2hrs
		console.log(req.body);
		res.redirect("/create_poll");
	}

	// all json related

	create_poll_process_ajax(req, res) {
		let choices = [];
		for (let i = 0; i < req.body.choice.length; i++) {
			choices.push({
				choice: req.body.choice[i],
				vote: 0,
			});
		}
		client.hmset("poll_question", ["question", req.body.question, "choices", JSON.stringify(choices)], (err, result) => {
			console.log(`here are the results ${result}`);
		});

		client.expire("poll_question", 7200); ///expire in 2hrs
		console.log(req.body);

		res.json({ message: "Poll question has been created succussfully " });
	}

	teacher_response_data_json(req, res) {
		client.exists("poll_question", async (err, result) => {
			if (result == 0) {
				res.redirect("/teacher_create_poll");
				return false;
			}
			client.hgetall("poll_question", async (err, obj) => {
				console.log(obj);
				let list = JSON.parse(obj.choices);

				let response_list = [];
				for (let i = 0; i < list.length; i++) {
					response_list.push({
						y: list[i].vote,
						label: list[i].choice,
					});
				}
				console.log(response_list);
				res.json({ response_list });
			});
		});
	}

	get_vote_count_json(req, res) {
		client.exists("poll_question", (err, result) => {
			if (result == 0) {
				return false;
			}
			client.hgetall("poll_question", (err, obj) => {
				console.log(obj);
				let list = JSON.parse(obj.choices);
				let total_vote = 0;
				for (let i = 0; i < list.length; i++) {
					// console.log(list[i].choice);
					total_vote = total_vote + list[i].vote;
				}

				res.json({ total_vote: total_vote });
			});
		});
	}
}

module.exports = Teachers;
