const sql_connection = require("../../db/db");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const createUserAnswer = async (req, res) => {
    try {
        const studentAnswers = req.body;

  const query = 'INSERT INTO studentanswers (userId, examId, questionId, answerId, ansStatus) VALUES ?';
  const values = studentAnswers.map(answer => [answer.userId, answer.examId, answer.questionId, answer.answerId, answer.ansStatus]);

  sql_connection.query(query, [values], (error) => {
    if (error) {
      console.error('Error inserting student answers:', error);
      res.status(500).json({ error: 'Failed to insert student answers' });
      return;
    }

    res.json({ message: 'Student answers inserted successfully' });
  });
    } catch (error) {
        console.error('Error saving user answer:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateUserAnswer = async (req, res) => {
  try {
      const stdAnsId = req.params.stdAnsId;
      const { userId, examId, questionId, answerId, ansStatus } = req.body;

      const updateQuery = 'UPDATE studentanswers SET userId = ?, examId = ?, questionId = ?, answerId = ?, ansStatus = ? WHERE studentAns_Id = ?';
        await sql_connection.query(updateQuery, [userId, examId, questionId, answerId, ansStatus, stdAnsId]);

        res.json({ message: 'Student answers updated successfully' });

  } catch (error) {
      console.error('Error updating user answer:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};

const getExistingAnswer = async (req, res) => {
  const { userId, examId, questionId } = req.params;

  try {
    const result = await new Promise((resolve, reject) => {
      sql_connection.query(
        'SELECT * FROM studentanswers WHERE userId = ? AND examId = ? AND questionId = ?',
        [userId, examId, questionId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
    res.json(result)
  } catch (error) {
    console.error('Error fetching student answer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const getAllUserAns =async (req,res) => {
  const { userId, examId } = req.params;

  
  try {
    const result = await new Promise((resolve, reject) => {
      sql_connection.query(
        'SELECT * FROM studentanswers where userId = ? and examId = ?',
        [userId, examId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
    res.json(result)
  } catch (error) {
    console.error('Error fetching student answers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

const getStudentAnswer =async (req,res) => {
  const { questionId } = req.params;

  try {
    const result = await new Promise((resolve, reject) => {
      sql_connection.query(
        'SELECT * FROM studentanswers where questionId = ? ',
        [questionId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
    res.json(result)
  } catch (error) {
    console.error('Error fetching student answer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 

module.exports = { createUserAnswer, updateUserAnswer, getExistingAnswer, getAllUserAns, getStudentAnswer };