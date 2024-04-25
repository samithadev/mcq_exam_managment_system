import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { validateInputs } from "./updateExamValidations";

function UpdateExam() {
  const { id: examId } = useParams();
  const [examName, setExamName] = useState("");
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // const [savedStartDate, setSavedStartDate] = useState("");
  // const [savedEndDate, setSavedEndDate] = useState("");
  const [examTime, setExamTime] = useState("");

  const navigate = useNavigate();

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      answers: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    },
  ]);
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  useEffect(() => {
    const fetchExamDetails = async () => {
      const token = localStorage.getItem("token");

      try {
        //get exam details and set exam details to form
        const examDetailsResponse = await fetch(
          `http://localhost:8000/exam/${examId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!examDetailsResponse.ok) {
          throw new Error("Failed to fetch exam details");
        }

        const examDetails = await examDetailsResponse.json();

        const durationDays = Math.floor(examDetails[0].duration / (24 * 60));
        const remainingDuration = examDetails[0].duration % (24 * 60);
        const durationHours = Math.floor(remainingDuration / 60);
        const durationMinutes = remainingDuration % 60;

        const formattedExamStartYear = new Date(
          examDetails[0].examDate
        ).getFullYear();
        const formattedExamStartMonth = String(
          new Date(examDetails[0].examDate).getMonth() + 1
        ).padStart(2, "0");
        const formattedExamStartDay = String(
          new Date(examDetails[0].examDate).getDate()
        ).padStart(2, "0");

        const formattedExamStartDate =
          formattedExamStartYear +
          "-" +
          formattedExamStartMonth +
          "-" +
          formattedExamStartDay;
        // const formattedExamEndDate = new Date(examDetails[0].examEndDate)
        //   .toLocaleDateString()
        //   .split("T")[0];

        console.log(formattedExamStartDate);
        // console.log(formattedExamEndDate);

        setExamName(examDetails[0].exam_name);
        setDays(durationDays);
        setHours(durationHours);
        setMinutes(durationMinutes);
        // setSavedStartDate(formattedExamStartDate);
        // setSavedEndDate(formattedExamEndDate);
        setStartDate(formattedExamStartDate);
        setExamTime(examDetails[0].examTime);

        //get all question details
        const questionsResponse = await fetch(
          `http://localhost:8000/question/allquestions/${examId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!questionsResponse.ok) {
          throw new Error("Failed to fetch questions and answers");
        }

        const allquestionsAndanswers = await questionsResponse.json();

        const groupedQuestions = allquestionsAndanswers.reduce((acc, item) => {
          const questionIndex = acc.findIndex(
            (q) => q.questionId === item.question_Id
          );
          const answer = { text: item.answer, isCorrect: item.status === 1 };

          if (questionIndex > -1) {
            acc[questionIndex].answers.push(answer);
          } else {
            acc.push({
              questionId: item.question_Id,
              questionText: item.question,
              answers: [answer],
            });
          }

          return acc;
        }, []);

        setQuestions(groupedQuestions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchExamDetails();
  }, [examId]);

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

  const handleSaveExam = async () => {
    // Calculate total duration in minutes
    const totalDuration =
      parseInt(days) * 1440 + parseInt(hours) * 60 + parseInt(minutes);
    // const examStartDate = new Date(startDate).toISOString().slice(0, 16);

    const examEndDate = calculateEndDate();

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

      console.log(questions);

      // Map questions and answers to the format expected by the backend
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        answers: q.answers.map((a) => ({
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      }));

      // Insert the exam
      const res = await fetch(`http://localhost:8000/exam/${examId}`, {
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
      console.error("Error save exam:", error);
    }
  };

  const handlePublishExam = async () => {
    // Calculate total duration in minutes
    const totalDuration =
      parseInt(days) * 1440 + parseInt(hours) * 60 + parseInt(minutes);
    // const examStartDate = new Date(startDate).toISOString().slice(0, 16);

    const examEndDate = calculateEndDate();

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

      console.log(questions);

      // Map questions and answers to the format expected by the backend
      const formattedQuestions = questions.map((q) => ({
        questionText: q.questionText,
        answers: q.answers.map((a) => ({
          text: a.text,
          isCorrect: a.isCorrect,
        })),
      }));

      // Insert the exam
      const res = await fetch(`http://localhost:8000/exam/${examId}`, {
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
      console.log(res);
    } catch (error) {
      console.error("Error publishing exam:", error);
    }
  };

  return (
    <div className="flex flex-row justify-center gap-10 p-8 ">
      <div>
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
            <span className="ml-2">days</span>
            <input
              type="number"
              id="hours"
              className="w-16 border-gray-300 border rounded-md p-2"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
            <span className="ml-2">hours</span>
            <input
              type="number"
              id="minutes"
              className="w-16 border-gray-300 border rounded-md p-2"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              required
            />
            <span className="ml-2">minutes</span>
          </div>
        </div>
        {/* dates saved */}
        {/* <div className="mt-4 flex gap-16">
          <div>
            <label htmlFor="date" className="block">
              Saved Exam Start Date
            </label>
            <input
              type="text"
              id="saved start"
              className="w-full border-gray-300 bg-slate-300 border rounded-md p-2"
              value={savedStartDate}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="date" className="block">
              Saved Exam Time
            </label>
            <input
              type="time"
              id="saved end"
              className="w-full border-gray-300 bg-slate-300 border rounded-md p-2"
              value={savedEndDate}
              readOnly
            />
          </div>
        </div> */}
        {/* --------------------- */}
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

export default UpdateExam;
