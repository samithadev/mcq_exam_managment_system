const sql_connection = require("../../db/db");

const getAnswers = async (req, res) => {
    try {
        const { id: questionId } = req.params;

        const answers = await new Promise((resolve, reject) => {
            sql_connection.query(
                "SELECT * FROM answers WHERE questionId = ?",
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

          if (!answers) {
            return res.status(404).json({ message: "answers not found" });
        }

        res.status(200).json(answers);
    } catch (error) {
        console.error("Error fetching answers:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAnsStatus = async (req, res) => {
  try{
    const {questionId, answerId} = req.params;

    const ansStatus = await new Promise((resolve, reject) => {
      sql_connection.query(
          "SELECT status from answers where questionId=? and answerId=?",
          [questionId, answerId],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        }
      );
    });

    res.status(200).json(ansStatus);

  }catch (error){
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getAnswers, getAnsStatus };