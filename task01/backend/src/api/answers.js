const express = require('express');
const { getAnswers, getAnsStatus } = require('../application/features/answers');

const answerRouter = express.Router();

answerRouter.route("/:id").get(getAnswers)
answerRouter.route("/:questionId/:answerId").get(getAnsStatus)

module.exports = answerRouter;