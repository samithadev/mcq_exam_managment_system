const sql_connection = require("../../db/db");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const createUser = async (req, res) => {
    try {
        const { email, password, roleName } = req.body;

        // Check if the email is already registered
        const existingUser = await new Promise((resolve, reject) => {
            sql_connection.query('SELECT * FROM user WHERE email = ?', [email], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Get the role_id from the role table based on the roleName
        const role = await new Promise((resolve, reject) => {
            sql_connection.query('SELECT role_id FROM role WHERE role_name = ?', [roleName], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!role) {
            return res.status(400).json({ message: 'Role not found' });
        }

        // Insert the new user into the database
        const newUser = { email, password, role: role.role_id };
        await new Promise((resolve, reject) => {
            sql_connection.query('INSERT INTO user SET ?', newUser, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const allUsers = async (req,res) => {
    try {
        // Fetch all roles from the database
        const users = await new Promise((resolve, reject) => {
            sql_connection.query('SELECT * FROM user', (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists and the password is correct
        const user = await new Promise((resolve, reject) => {
            sql_connection.query('SELECT * FROM user WHERE email = ? AND password = ?', [email, password], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results[0]);
                }
            });
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({userId:user.user_id , email: user.email, role:user.role }, process.env.JWT_SECRET_KEY);

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {createUser, allUsers, loginUser};