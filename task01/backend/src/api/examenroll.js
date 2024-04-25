const express = require('express');
const {newEnroll, updateEnroll, getEnrollments, getUserEnroll} = require('../application/features/examenroll');

const examenrollRouter = express.Router();

examenrollRouter.route("/:userId/:examId").post(newEnroll).get(getUserEnroll).put(updateEnroll)
examenrollRouter.route("/:examId").get(getEnrollments)

module.exports = examenrollRouter;