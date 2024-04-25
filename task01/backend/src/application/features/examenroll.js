require("dotenv").config();
const sql_connection = require("../../db/db");

const newEnroll = async (req, res) => {
    const { userId, examId } = req.params;
    const { status } = req.body;
  
    try {
        // Insert the new enrollment
        await sql_connection.query(
            'INSERT INTO exam_enrollment (userId, examId, enrollStatus) VALUES (?, ?, ?)',
            [userId, examId, status]
        );
        res.status(201).json({ message: 'New enrollment created successfully' });
    } catch (error) {
        console.error('Error creating new enrollment:', error);
        res.status(500).json({ message: 'Failed to create new enrollment' });
    }
}

const updateEnroll = async (req,res) => {

    const { userId, examId } = req.params;
    const { grade, points, passfailStatus, enrollStatus, completeDate } = req.body;
  
    try {
        // Update the enrollment
        await sql_connection.query(
            'UPDATE exam_enrollment SET grade = ?, points = ?, passfailStatus = ?, enrollStatus = ?, completeDate = ? WHERE userId = ? AND examId = ?',
            [grade, points, passfailStatus, enrollStatus,completeDate, userId, examId]
        );
        res.status(200).json({ message: 'Enrollment updated successfully' });
    } catch (error) {
        console.error('Error updating enrollment:', error);
        res.status(500).json({ message: 'Failed to update enrollment' });
    }
}

const getUserEnroll = async (req, res) => {
    const { examId, userId } = req.params;

    try {
       
        const enrollStatus = await new Promise((resolve, reject) => {
            sql_connection.query('SELECT * FROM exam_enrollment WHERE examId = ? AND userId = ?',[examId, userId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        if (enrollStatus) {
          res.json(enrollStatus );
        } else {
          res.status(404).json({ message: "User not enrolled in exam" });
        }
      } catch (error) {
        console.error("Error checking enrollment status:", error);
        res.status(500).json({ message: "Internal server error" });
      }
}

const getEnrollments = async (req,res) => {
    const {examId} = req.params;

    try{
        const allEnrollments = await new Promise((resolve, reject) => {
            sql_connection.query('SELECT * FROM exam_enrollment WHERE examId = ?',[examId], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    
        if (allEnrollments) {
            res.json(allEnrollments );
          } else {
            res.status(404).json({ message: "Exam not have enrolles" });
          }
    }catch(error){
        res.status(500).json({ message: "Internal server error" });
    }

}

module.exports = {newEnroll, getUserEnroll, updateEnroll, getEnrollments}
