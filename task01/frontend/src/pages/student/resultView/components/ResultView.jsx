import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function ResultView() {
  const { id: examId } = useParams();
  const [result, setResult] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);

  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.userId;

  useEffect(() => {
    const fetchExamResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/examenroll/${userId}/${examId}`
        );

        const userAnsRes = await axios.get(
          `http://localhost:8000/studentAnswers/${userId}/${examId}`
        );
        setResult(response.data[0]);
        setUserAnswers(userAnsRes.data);
      } catch (error) {
        console.log("no fetching data");
      }
    };

    fetchExamResults();
  }, []);

  if (!result) {
    return <div>Loading...</div>; // Or any other placeholder content
  }
  return (
    <div className=" flex flex-col items-center pt-20 h-screen w-screen gap-5">
      <div className=" border-solid border-2 w-1/2  p-8">
        <h1 className=" text-3xl">Exam completed</h1>

        <h1
          className={` text-8xl ${
            result.passfailStatus == "pass" ? "text-green-600" : "text-red-600"
          }  text-center py-8`}
        >
          {result.passfailStatus == "pass" ? "Pass" : "Fail"}
        </h1>
        <h2 className=" text-2xl text-center">
          {result.grade} - {result.points} points
        </h2>
      </div>

      <div className=" border-solid border-2 w-1/2  p-8">
        <h1 className=" text-3xl">Questions</h1>
        <div className="flex flex-col gap-4 mt-6">
          {userAnswers.map((answer, index) => (
            <div
              key={index}
              className="flex justify-between border-2 border-solid py-7 px-8 text-xl"
            >
              <h1>{answer.questionId}</h1>
              <h1
                className={`font-bold ${
                  answer.ansStatus == "correct"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {answer.ansStatus == "correct" ? "Correct" : "Wrong"}
              </h1>
            </div>
          ))}
        </div>
      </div>

      <div className=" pt-8">
        <Link
          to={"/student/dashboard"}
          className=" px-8 py-4 rounded-lg text-xl bg-red-600 text-white font-bold"
        >
          Close
        </Link>
      </div>
    </div>
  );
}

export default ResultView;
