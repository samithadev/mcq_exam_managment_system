import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { validateInputs } from "./createExamValidations";

function CreateExam() {
  const [examName, setExamName] = useState("");
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [examTime, setExamTime] = useState("");

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);

  const calculateEndDate = () => {
    const duration =
      parseInt(days) * 1440 + parseInt(hours) * 60 + parseInt(minutes); // Duration in minutes
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 60000);
    return end.toISOString().split("T")[0]; // format to match input type datetime-local
  };

  const handleUpdate = (questionIndex) => {
    const selectedQuestion = questions[questionIndex];
    setQuestionText(selectedQuestion.questionText);
    setAnswers(
      selectedQuestion.answers.map((a) => ({
        text: a.text,
        isCorrect: a.isCorrect,
      }))
    );
    setSelectedQuestionIndex(questionIndex);
  };

  const handleUpdateQuestion = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      questionText: questionText,
      answers: answers.map((a) => ({ text: a.text, isCorrect: a.isCorrect })),
    };
    setQuestions(updatedQuestions);
    setQuestionText("");
    setAnswers([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
    setSelectedQuestionIndex(null);
  };

  const navigate = useNavigate();

  const handleAddQuestion = () => {
    const newQuestion = { questionText, answers };
    setQuestions([...questions, newQuestion]);
    setQuestionText("");
    setAnswers([
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]);
  };

  const handleAddAnswer = (index, answerText) => {
    const newAnswers = [...answers];
    newAnswers[index].text = answerText;
    setAnswers(newAnswers);
  };

  const handleSelectCorrectAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers[index].isCorrect = !newAnswers[index].isCorrect;
    setAnswers(newAnswers);
  };
  const handleDeleteQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handlePublishExam = async () => {
    // Calculate total duration in minutes
    const totalDuration =
      parseInt(days) * 24 * 60 + parseInt(hours) * 60 + parseInt(minutes);
    // const examStartDate = new Date(startDate).tol;

    const examEndDate = calculateEndDate();

    console.log("start: " + startDate);
    console.log("end: " + examEndDate);
    console.log("exam time: " + examTime);

    const validationError = validateInputs(
      examName,
      totalDuration,
      startDate,
      endDate,
      questions
    );
    if (validationError) {
      alert(validationError);
      return;
    }
    try {
      const token = localStorage.getItem("token");

      // Map questions and answers to the format expected by the backend
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        answers: q.answers.map((a) => ({
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      }));

      // Insert the exam into the exam_table
      const res = await fetch("http://localhost:8000/exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exam_name: examName,
          duration: totalDuration,
          examDate: startDate,
          examEndDate: examEndDate,
          examTime: examTime,
          status: "published",
          questions: formattedQuestions,
        }),
      });

      // Display success message or redirect to exams page
      alert("Exam Published successfully");
      navigate("/teacher/dashboard");
    } catch (error) {
      console.error("Error publishing exam:", error);
    }
  };

  const handleSaveExam = async () => {
    // Calculate total duration in minutes
    const totalDuration =
      parseInt(days) * 24 * 60 + parseInt(hours) * 60 + parseInt(minutes);

    const examEndDate = calculateEndDate();

    console.log("start: " + startDate);
    console.log("end: " + examEndDate);

    const validationError = validateInputs(
      examName,
      totalDuration,
      startDate,
      examEndDate,
      questions
    );
    if (validationError) {
      alert(validationError);
      return;
    }
    try {
      const token = localStorage.getItem("token");

      // Map questions and answers to the format expected by the backend
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        answers: q.answers.map((a) => ({
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      }));

      //Insert the exam into the exam_table
      const res = await fetch("http://localhost:8000/exam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exam_name: examName,
          duration: totalDuration,
          examDate: startDate,
          examEndDate: examEndDate,
          examTime: examTime,
          status: "draft",
          questions: formattedQuestions,
        }),
      });

      // Display success message or redirect to exams page
      alert("Exam Saved successfully");
      navigate("/teacher/dashboard");
      console.log(res);
    } catch (error) {
      console.error("Error publishing exam:", error);
    }
  };

  return (
    <div className="flex flex-row justify-center gap-10 p-8 ">
      <div className=" ">
        <div className=" flex items-center  gap-4">
          <Link
            className=" bg-slate-400 p-2 rounded-lg"
            to={"/teacher/dashboard"}
          >
            Back
          </Link>
          <h1 className="text-2xl font-bold mt-8">Create Exam</h1>
        </div>
        <div className="mt-4">
          <label htmlFor="examName" className="block">
            Exam Name
          </label>
          <input
            type="text"
            id="examName"
            className="w-full border-gray-300 border rounded-md p-2"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            required
          />
        </div>
        <div className="mt-4">
          <label htmlFor="duration" className="block">
            Duration
          </label>
          <div className=" flex w-1/2 gap-5">
            <input
              type="number"
              id="days"
              className=" w-16 border-gray-300 border rounded-md p-2"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              required
            />
            <span>days</span>
            <input
              type="number"
              id="hours"
              className="w-16 border-gray-300 border rounded-md p-2"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
            <span>hours</span>
            <input
              type="number"
              id="minutes"
              className="w-16 border-gray-300 border rounded-md p-2"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              required
            />
            <span>minutes</span>
          </div>
        </div>
        <div className="mt-4 flex gap-16">
          <div>
            <label htmlFor="date" className="block">
              Exam Start Date
            </label>
            <input
              type="date"
              id="date"
              className="w-full border-gray-300 border rounded-md p-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block">
              Exam Time
            </label>
            <input
              type="time"
              id="time"
              className="w-full border-gray-300 border rounded-md p-2"
              value={examTime}
              onChange={(e) => setExamTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className=" mt-8">
          <button
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-10"
            onClick={handlePublishExam}
          >
            Publish Exam
          </button>
          <button
            className="mt-4 bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSaveExam}
          >
            Save Exam
          </button>
        </div>
      </div>

      <div>
        <div className="mt-8">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2">Question</th>
                <th className="p-2">Answers</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{q.questionText}</td>
                  <td className="p-2">
                    <ul>
                      {q.answers.map((a, index) => (
                        <li
                          key={index}
                          className={
                            a.isCorrect ? "text-green-500 font-bold" : ""
                          }
                        >
                          {a.text}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-2">
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold px-2 rounded"
                      onClick={() => handleUpdate(index)}
                    >
                      Update
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold px-2 rounded"
                      onClick={() => handleDeleteQuestion(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="">
        <div className="mt-4">
          <label htmlFor="question" className="block">
            Question
          </label>
          <input
            type="text"
            id="question"
            className="w-full border-gray-300 border rounded-md p-2"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className="block">Answers</label>
          {answers.map((answer, index) => (
            <div key={index} className="flex items-center mt-2">
              <input
                type="text"
                className="border-gray-300 border rounded-md p-2 mr-2"
                value={answer.text}
                onChange={(e) => handleAddAnswer(index, e.target.value)}
              />
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-500"
                checked={answer.isCorrect}
                onChange={() => handleSelectCorrectAnswer(index)}
              />
            </div>
          ))}

          <button
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              if (selectedQuestionIndex !== null) {
                handleUpdateQuestion(selectedQuestionIndex);
              } else {
                handleAddQuestion();
              }
            }}
          >
            {selectedQuestionIndex !== null
              ? "Update Question"
              : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateExam;
