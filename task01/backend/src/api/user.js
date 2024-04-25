const express = require('express');
const {createUser, allUsers, loginUser} = require('../application/features/user');

const userRouter = express.Router();

userRouter.route('/').post(createUser).get(allUsers)
userRouter.route('/login').post(loginUser)

module.exports = userRouter;