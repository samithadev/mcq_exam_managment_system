const express = require('express');
const { getQuestion, getallQuestions } = require('../application/features/question');

const questionRouter = express.Router();

questionRouter.route("/:id").get(getQuestion)
questionRouter.route("/allquestions/:id").get(getallQuestions)

module.exports = questionRouter;