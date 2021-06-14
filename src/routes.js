module.exports = (app) => {
	const teacherController = require("./controllers/Teachers");
	const teacher = new teacherController();

	const pollsController = require("./controllers/Polls");
	const poll = new pollsController();

	const studentsController = require("./controllers/Students");
	const student = new studentsController();

	app.get("/", poll.index);
	app.get("/teacher_index", teacher.teacher_index);
	app.get("/create_poll", teacher.teacher_create_poll);
	app.get("/teacher_response_data", teacher.teacher_response_data);
	app.get("/teacher_response_data_json", teacher.teacher_response_data_json);

	app.get("/student_poll", student.poll_view);
	app.get("/student_response_view", student.student_response_view);

	app.get("/get_vote_count_json", teacher.get_vote_count_json);

	app.post("/create_poll_process", teacher.create_poll_process);

	app.post("/create_poll_process_ajax", teacher.create_poll_process_ajax);

	app.post("/submit_response_process", student.submit_response_process);

	app.post("/submit_response_process_json", student.submit_response_process_json);
};
