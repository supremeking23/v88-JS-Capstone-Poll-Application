module.exports = (app) => {
	const teacherController = require("./controllers/Teachers");
	const teacher = new teacherController();

	const pollsController = require("./controllers/Polls");
	const poll = new pollsController();

	app.get("/", poll.index);
	app.get("/teacher_index", teacher.teacher_index);
	app.get("/create_poll", teacher.teacher_create_poll);
};
