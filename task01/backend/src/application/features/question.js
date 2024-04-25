const sql_connection = require("../../db/db");

const getQuestion = async (req, res) => {
    try {
        const { id: examId } = req.params;

        const questions = await new Promise((resolve, reject) => {
            sql_connection.query(
                "SELECT * from questions WHERE examId = ?",
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

          if (!questions) {
            return res.status(404).json({ message: "questions not found" });
        }

        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching exam:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getallQuestions = async (req, res) => {
  try {
      const { id: examId } = req.params;

      const questions = await new Promise((resolve, reject) => {
          sql_connection.query(
              "SELECT q.examId,q.question_Id, q.question, a.answer, a.status FROM questions q INNER JOIN answers a ON q.question_Id = a.questionId WHERE q.examId = ?",
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

        if (!questions) {
          return res.status(404).json({ message: "questions not found" });
      }

      res.status(200).json(questions);
  } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getQuestion, getallQuestions };