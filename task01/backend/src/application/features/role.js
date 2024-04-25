const sql_connection = require("../../db/db");


const allRoles = async (req,res) => {
    try {
        // Fetch all roles from the database
        const roles = await new Promise((resolve, reject) => {
            sql_connection.query('SELECT * FROM role', (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = allRoles;