const jwt = require("jsonwebtoken");
require("dotenv").config();
const sql_connection = require("../../db/db");

const createExam = async (req, res) => {
    try {
      const { exam_name, duration, examDate,examEndDate,examTime, status, questions } = req.body;
  
      // Get user's email from JWT token
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user_email = decodedToken.email;
  
      // Get user's role from email
      const user = await new Promise((resolve, reject) => {
        sql_connection.query(
          "SELECT * FROM user WHERE email = ?",
          [user_email],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results[0]);
            }
          }
        );
      });
  
      if (!user || user.role !== 1) {
        // Assuming role_id 1 is for teachers
        return res
          .status(403)
          .json({ message: "Unauthorized. Only teachers can create exams" });
      }
  
      // Insert the new exam into the database
      const newExam = {
        exam_name,
        duration,
        examDate,
        examEndDate,
        examTime,
        status,
        createdUser: user.user_id,
      };
      const insertExam = await new Promise((resolve, reject) => {
        sql_connection.query(
          "INSERT INTO exam SET ?",
          newExam,
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });
  
      const examId = insertExam.insertId;
  
      // Insert questions and answers into the database
      for (const question of questions) {
        const { questionText, answers } = question;
  
        const insertQuestion = await new Promise((resolve, reject) => {
          sql_connection.query(
            "INSERT INTO questions (examId, question) VALUES (?, ?)",
            [examId, questionText],
            (error, results) => {
              if (error) {
                reject(error);
              } else {
                resolve(results);
              }
            }
          );
        });
  
        const questionId = insertQuestion.insertId;
  
        for (const answer of answers) {
          const insertAnswer = await new Promise((resolve, reject) => {
            sql_connection.query(
              "INSERT INTO answers (questionId, answer, status) VALUES (?, ?, ?)",
              [questionId, answer.text, answer.isCorrect ? 1 : 0],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results);
                }
              }
            );
          });
        }
      }
      res.status(201).json({ message: "Exam created successfully" });
    } catch (error) {
      console.error("Error creating exam:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

const teacherAllExams = async (req, res) => {
  try {
    // Get user's email from JWT token
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user_email = decodedToken.email;

    // Get user's role from email
    const user = await new Promise((resolve, reject) => {
      sql_connection.query(
        "SELECT * FROM user WHERE email = ?",
        [user_email],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results[0]);
          }
        }
      );
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Fetch all exams from the database
    const exams = await new Promise((resolve, reject) => {
      sql_connection.query(
        "SELECT * FROM exam WHERE createdUser = ?",
        [user.user_id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    res.status(200).json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get all exams
const allExams = async (req,res) => {
  try{
    // Fetch all exams from the database
    const allExams = await new Promise((resolve, reject) => {
      sql_connection.query(
        "SELECT * FROM exam",
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
    res.status(200).json(allExams);

  } catch{
    res.status(500).json({ message: "Internal server error" });
  }
}

//Get specific exams
const getExam = async (req,res) => {
  try{
    const {id:exam_id }= req.params;
    // Fetch specific exam from the database
    const getExam = await new Promise((resolve, reject) => {
      sql_connection.query(
        "SELECT * FROM exam WHERE exam_id = ?",[exam_id],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });
    res.status(200).json(getExam);

  } catch{
    res.status(500).json({ message: "Internal server error" });
  }
}

//get exam enroll status
const getEnrollStatus = async (req,res) => {
  try {
    const { examId, userId } = req.params;

    // Query the database to get the enrollment status for the specified examId and userId
    const query = `SELECT enrollStatus FROM exam_enrollment WHERE examId = ? AND userId = ?`;
    const [rows] = await sql_connection.query(query, [examId, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.json({ enrollStatus: rows[0].enrollStatus });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

const deleteExam = async (req, res) => {
    try {
      const { examId } = req.params;
  
      // Check if the exam exists
      const examExists = await new Promise((resolve, reject) => {
        sql_connection.query(
          "SELECT * FROM exam WHERE exam_id = ?",
          [examId],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results.length > 0);
            }
          }
        );
      });
  
      if (!examExists) {
        return res.status(404).json({ message: "Exam not found" });
      }
  
      // Delete the exam from the database
      await new Promise((resolve, reject) => {
        sql_connection.query(
          "DELETE FROM exam WHERE exam_id = ?",
          [examId],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          }
        );
      });
  
      res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  };

  const getExamsStatus = async (req, res) => {
    const {userId} = req.params;

    const allexamstatus = await new Promise((resolve, reject) => {
      sql_connection.query(
        "SELECT e.exam_id, e.exam_name, e.duration, e.examDate,e.examEndDate,e.examTime, ee.enrollStatus FROM exam e LEFT JOIN exam_enrollment ee ON e.exam_id = ee.examId AND ee.userId = ? WHERE e.status = 'published'",
        [userId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    res.json(allexamstatus)

  }

  const updateExam = async (req, res) => {
    try {
      const { exam_name, duration, examDate,examEndDate,examTime, status, questions } = req.body;
      const { id: examId } = req.params;  

      // Verify user's authorization from JWT token
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const user_email = decodedToken.email;
  
      // Fetch user's role from their email
      const user = await new Promise((resolve, reject) => {
        sql_connection.query(
          "SELECT * FROM user WHERE email = ?",
          [user_email],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results[0]);
            }
          }
        );
      });
  
      if (!user || user.role !== 1) { // Assuming role_id 1 is for teachers
        return res.status(403).json({ message: "Unauthorized. Only teachers can update exams." });
      }
  
      // Update the exam record in the database
      await new Promise((resolve, reject) => {
        sql_connection.query(
          "UPDATE exam SET exam_name = ?, duration = ?, examDate = ?,examEndDate=?,examTime=?, status = ? WHERE exam_id = ?",
          [exam_name, duration, examDate,examEndDate,examTime, status, examId],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });

      // Delete all answers
      await new Promise((resolve, reject) => {
        sql_connection.query(
          "DELETE  FROM answers WHERE questionId IN (SELECT question_Id FROM questions WHERE examId = ?)",
          [examId],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });

      // Delete all questions
      await new Promise((resolve, reject) => {
        sql_connection.query(
          "Delete from questions where examId = ?",
          [examId],
          (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });

      // Process each new question
      for (const question of questions) {
        const { questionText, answers } = question;

        const insertQuestion = await new Promise((resolve, reject) => {
          sql_connection.query(
            "INSERT INTO questions (examId, question) VALUES (?, ?)",
            [examId, questionText],
            (error, results) => {
              if (error) {
                reject(error);
              } else {
                resolve(results);
              }
            }
          );
        });
  
        const questionId = insertQuestion.insertId;
  
        for (const answer of answers) {
          const insertAnswer = await new Promise((resolve, reject) => {
            sql_connection.query(
              "INSERT INTO answers (questionId, answer, status) VALUES (?, ?, ?)",
              [questionId, answer.text, answer.isCorrect ? 1 : 0],
              (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(results);
                }
              }
            );
          });
        }
      }
      res.status(201).json({ message: "Exam saved successfully" });
    } catch (error) {
      console.error("Error updating exam:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

const updateExamEndDate = async (req, res) => {
  const { examId } = req.params;
  const { examEndDate } = req.body;

  try {
    await new Promise((resolve, reject) => {
      sql_connection.query(
        "UPDATE exam SET examEndDate = ? WHERE exam_id = ?",
        [examEndDate, examId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    res.json({ message: "Exam end date updated successfully" });
  } catch (error) {
    console.error("Error updating exam end date:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

  

module.exports = { createExam, teacherAllExams, deleteExam ,allExams, getEnrollStatus, getExam, getExamsStatus, updateExam,updateExamEndDate};
