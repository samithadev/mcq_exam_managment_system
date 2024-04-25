import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate, Link } from "react-router-dom";

function ExamView() {
  const { id: examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [userId, setUserId] = useState();
  const [ansStatus, setAnswerStatus] = useState({});
  const [timeDuration, setTimeDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const timerRef = useRef(null);

  const navigate = useNavigate();

  //get questions and answers and set those tho questions and answers array
  useEffect(() => {
    // Decode the token to get userId
    const token = localStorage.getItem("token");
    const decodedToken = jwtDecode(token);
    setUserId(decodedToken.userId);

    const fetchQuestionsAndAnswers = async () => {
      try {
        const questionsResponse = await axios.get(
          `http://localhost:8000/question/${examId}`
        );
        const fetchedQuestions = questionsResponse.data;
        setQuestions(fetchedQuestions);

        const fetchedAnswers = [];
        for (const question of fetchedQuestions) {
          const answersResponse = await axios.get(
            `http://localhost:8000/answers/${question.question_Id}`
          );
          fetchedAnswers.push(answersResponse.data);
        }

        const examDetails = await axios.get(
          `http://localhost:8000/exam/${examId}`
        );
        const fetchedexamDuration = examDetails.data[0].duration;
        console.log(examDetails.data);
        setTimeDuration(fetchedexamDuration);

        setAnswers(fetchedAnswers);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchQuestionsAndAnswers();
  }, []);

  useEffect(() => {
    const fetchExistingAnswers = async () => {
      try {
        const studentAnswersResponse = await axios.get(
          `http://localhost:8000/studentAnswers/${userId}/${examId}`
        );
        const studentAnswers = studentAnswersResponse.data;

        const defaultSelectedAnswers = {};
        studentAnswers.forEach((answer) => {
          defaultSelectedAnswers[answer.questionId] = answer.answerId;
        });

        setSelectedAnswers(defaultSelectedAnswers);
      } catch (error) {
        console.error("Error fetching existing answers:", error);
      }
    };

    fetchExistingAnswers();
  }, [userId, examId]);

  useEffect(() => {
    const ExamTimeDiff = async () => {
      try {
        const examDetailsResponse = await axios.get(
          `http://localhost:8000/exam/${examId}`
        );

        const durationInSeconds = examDetailsResponse.data[0].duration * 60; // Convert minites to seconds
        setTimeDuration(durationInSeconds);
        setTimeLeft(durationInSeconds);
        console.log("Duration : ", durationInSeconds);
      } catch (error) {
        console.error("Error fetching exam end date:", error);
      }
    };

    ExamTimeDiff();
  }, [examId]);

  // useEffect(() => {
  //   if (timeDuration !== null) {
  //     timerRef.current = setInterval(() => {
  //       setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
  //     }, 1000);
  //   }
  // }, [timeDuration]);

  useEffect(() => {
    let timerId;
    const updateTimeLeft = () => {
      timerId = setTimeout(() => {
        if (timeLeft > 0) {
          setTimeLeft(timeLeft - 1);
          updateTimeLeft(); // Call updateTimeLeft recursively
        }
      }, 1000);
    };

    if (timeDuration !== null) {
      updateTimeLeft();
    }

    return () => {
      clearTimeout(timerId); // Clear the timer when the component unmounts or when timeDuration changes
    };
  }, [timeDuration, timeLeft]);

  // Finish the paper when the time is up
  useEffect(() => {
    if (timeLeft === 0) {
      clearInterval(timerRef.current);
      alert("Time is over!!");
      handleComplete();
    }
  }, [timeLeft]);

  // Function to format time as "hours:minutes:seconds"
  const formatTime = (timeInSeconds) => {
    const days = Math.floor(timeInSeconds / (3600 * 24));
    const hours = Math.floor((timeInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${days}day: ${hours}h: ${minutes}min: ${seconds}sec`;
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex < questions.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : prevIndex
    );
  };

  const handleAnswerSelection = async (questionId, answerId) => {
    setSelectedAnswers((prevSelectedAnswers) => ({
      ...prevSelectedAnswers,
      [questionId]: answerId,
    }));

    const ansStatus = await axios.get(
      `http://localhost:8000/answers/${questionId}/${answerId}`
    );
    const fetchedAnsStatus = ansStatus.data;
    setAnswerStatus((prevansStatus) => ({
      ...prevansStatus,
      [questionId]: fetchedAnsStatus[0].status,
    }));
  };

  const handleComplete = async () => {
    try {
      const studentAnswers = [];
      const newstudentAnswers = [];
      for (const question of questions) {
        const existingAnswerResponse = await axios.get(
          `http://localhost:8000/studentAnswers/${userId}/${question.examId}/${question.question_Id}`
        );
        const existingAnswer = existingAnswerResponse.data;
        console.log(existingAnswer);

        if (existingAnswer.length > 0) {
          // If the user has answered this question before, update the answer
          studentAnswers.push({
            id: existingAnswer[0].studentAns_Id,
            userId,
            examId: question.examId,
            questionId: question.question_Id,
            answerId: selectedAnswers[question.question_Id] || null,
            ansStatus:
              ansStatus[question.question_Id] === 1 ? "correct" : "wrong",
          });
        } else {
          // If the user has not answered this question before, create a new answer
          newstudentAnswers.push({
            userId,
            examId: question.examId,
            questionId: question.question_Id,
            answerId: selectedAnswers[question.question_Id] || null,
            ansStatus:
              ansStatus[question.question_Id] === 1 ? "correct" : "wrong",
          });
        }
      }

      const allStudentAnswers = [...studentAnswers, ...newstudentAnswers];

      // Calculate the total number of correct answers
      const totalCorrectAnswers = allStudentAnswers.reduce((acc, answer) => {
        return answer.ansStatus === "correct" ? acc + 1 : acc;
      }, 0);
      console.log(totalCorrectAnswers);

      // Calculate the percentage marks
      const marks = (totalCorrectAnswers / questions.length) * 100;
      console.log(marks);
      console.log(questions.length);

      // Calculate the grade and pass/fail status
      let grade;
      let passFailStatus;
      if (marks >= 85) {
        grade = "A";
        passFailStatus = "Pass";
      } else if (marks >= 65) {
        grade = "B";
        passFailStatus = "Pass";
      } else if (marks >= 45) {
        grade = "C";
        passFailStatus = "Pass";
      } else {
        grade = "F";
        passFailStatus = "Fail";
      }

      // Save or update the answers
      if (studentAnswers.length > 0) {
        for (const answer of studentAnswers) {
          await axios.put(
            `http://localhost:8000/studentAnswers/${answer.id}`,
            answer
          );
        }
      }

      if (newstudentAnswers.length > 0) {
        await axios.post(
          "http://localhost:8000/studentAnswers",
          newstudentAnswers
        );
      }

      const completeDate = new Date().toISOString().split("T")[0];
      // Update the status in the exam_enrollment table to 'pending'
      await axios.put(`http://localhost:8000/examenroll/${userId}/${examId}`, {
        grade: grade,
        points: marks,
        passfailStatus: passFailStatus,
        enrollStatus: "attended",
        completeDate: completeDate,
      });

      alert("Test Completed!");
      navigate(`/student/dashboard`);
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  const handleSave = async () => {
    try {
      const studentAnswers = [];
      const newstudentAnswers = [];
      for (const question of questions) {
        const existingAnswerResponse = await axios.get(
          `http://localhost:8000/studentAnswers/${userId}/${question.examId}/${question.question_Id}`
        );
        const existingAnswer = existingAnswerResponse.data;
        console.log(existingAnswer);

        if (existingAnswer.length > 0) {
          // If the user has answered this question before, update the answer
          studentAnswers.push({
            id: existingAnswer[0].studentAns_Id,
            userId,
            examId: question.examId,
            questionId: question.question_Id,
            answerId: selectedAnswers[question.question_Id] || null,
            ansStatus:
              ansStatus[question.question_Id] === 1 ? "correct" : "wrong",
          });
        } else {
          // If the user has not answered this question before, create a new answer
          newstudentAnswers.push({
            userId,
            examId: question.examId,
            questionId: question.question_Id,
            answerId: selectedAnswers[question.question_Id] || null,
            ansStatus:
              ansStatus[question.question_Id] === 1 ? "correct" : "wrong",
          });
        }
      }

      console.log(studentAnswers);
      // Save or update the answers
      if (studentAnswers.length > 0) {
        for (const answer of studentAnswers) {
          await axios.put(
            `http://localhost:8000/studentAnswers/${answer.id}`,
            answer
          );
        }
      }

      if (newstudentAnswers.length > 0) {
        await axios.post(
          "http://localhost:8000/studentAnswers",
          newstudentAnswers
        );
      }

      // Update the status in the exam_enrollment table to 'pending'
      await axios.put(`http://localhost:8000/examenroll/${userId}/${examId}`, {
        enrollStatus: "pending",
      });

      alert("Answers saved!");
      navigate(`/student/dashboard`);
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  return (
    <div className=" flex flex-col items-center justify-center h-screen w-screen">
      <div>
        <h1 className=" text-3xl pb-12">
          <span className=" text-red-600 font-bold">Time Left:</span>{" "}
          {formatTime(timeLeft)}
        </h1>
      </div>
      {questions.length > 0 && (
        <div className=" w-1/3">
          <p className=" text-2xl pb-8">
            Q : {questions[currentQuestionIndex].question}
          </p>
          <ul className=" border-2 border-solid text-2xl p-9 ">
            {answers.length > 0 &&
              answers[currentQuestionIndex].map((answer, index) => (
                <li key={index} className=" mt-4">
                  <label>
                    <input
                      type="checkbox"
                      value={answer.answerId}
                      className=" mr-4"
                      checked={
                        selectedAnswers[
                          questions[currentQuestionIndex].question_Id
                        ] === answer.answerId
                      }
                      onChange={() =>
                        handleAnswerSelection(
                          questions[currentQuestionIndex].question_Id,
                          answer.answerId
                        )
                      }
                    />
                    {answer.answer}
                  </label>
                </li>
              ))}
          </ul>
          <div className="flex justify-between w-full gap-5 text-white text-xl mt-8">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className=" px-9 py-2 rounded-lg bg-slate-400 "
            >
              Prev
            </button>
            <h2 className=" text-2xl text-black">
              Question {currentQuestionIndex + 1}
            </h2>
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className=" px-9 py-2 rounded-lg bg-slate-400 "
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-12 text-xl mt-16 text-white w-1/3">
        <button
          onClick={handleSave}
          className=" px-5 py-2 bg-green-800 rounded-lg"
        >
          Save
        </button>
        <button
          onClick={handleComplete}
          className=" px-5 py-2 bg-blue-500 rounded-lg"
        >
          Complete
        </button>

        <div className=" bg-red-600 text-white px-5 py-2 rounded-lg">
          <Link to={"/student/dashboard"}>Close</Link>
        </div>
      </div>
    </div>
  );
}

export default ExamView;
