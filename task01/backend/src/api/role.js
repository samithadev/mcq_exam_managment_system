const express = require('express');
const allRoles = require('../application/features/role');

const roleRouter = express.Router();

roleRouter.route('/').get(allRoles)

module.exports = roleRouter;