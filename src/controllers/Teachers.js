class Teachers {
	teacher_index(req, res) {
		res.render("teachers/teacher_index");
	}

	teacher_create_poll(req, res) {
		res.render("teachers/teacher_create_poll");
	}
}

module.exports = Teachers;
