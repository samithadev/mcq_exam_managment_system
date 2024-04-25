import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function MonitorExam() {
  const [exam, setExam] = useState([]);
  const { id: examId } = useParams();
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendedCount, setAttendedCount] = useState(0);
  const [timeDuration, setTimeDuration] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8000/exam/${examId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setExam(response.data[0]);

        // Fetch enrolled students
        const enrolledResponse = await axios.get(
          `http://localhost:8000/examenroll/${examId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Count the number of students who have attended
        const attended = enrolledResponse.data.filter(
          (student) => student.enrollStatus === "attended"
        );

        setEnrolledStudents(enrolledResponse.data);
        setAttendedCount(attended.length);
      } catch (error) {
        console.error("Error fetching exam details:", error.response.data);
      }
    };

    fetchExamDetails();
  }, [examId]);

  const handleEndExam = async () => {
    try {
      const token = localStorage.getItem("token");
      const date = new Date().toISOString().slice(0, 19).replace("T", " ");
      console.log(date);
      await axios.put(
        `http://localhost:8000/exam/updateExamDate/${examId}`,
        { examEndDate: date },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Optionally, you can update the state to reflect the new examEndDate
      // setExam((prevExam) => ({ ...prevExam, examEndDate: new Date() }));
    } catch (error) {
      console.error("Error ending exam:", error.response.data);
    }
  };

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
      // handleComplete();
      alert("Time is over!!");
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

  const handleExamOverview = () => {
    if (attendedCount === 0) {
      alert("No one has attended the exam yet!");
    } else {
      // Navigate to the exam overview page
      navigate(`/teacher/exam_overview/${examId}`);
    }
  };

  if (!exam) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className=" flex items-center gap-5 p-10">
        <Link
          to={"/teacher/dashboard"}
          className="p-3 bg-slate-500 rounded-xl text-white"
        >
          Back
        </Link>
        <h1 className=" text-2xl">{exam.exam_name}</h1>
      </div>
      <div className="flex justify-center p-10 gap-5">
        <div className="">
          <div className=" border-solid border-2 p-3">
            <h1 className=" text-2xl">Exam Completed</h1>
            <div className=" flex flex-col items-center p-10">
              <text className=" text-8xl">
                {attendedCount}/{enrolledStudents.length}
              </text>
              <h1 className=" text-xl mt-5">
                Time Left: {formatTime(timeLeft)}
              </h1>
            </div>
          </div>

          <div className=" border-solid border-2 p-3 mt-5">
            <h1 className=" text-xl mt-3">
              Exam started Date:{" "}
              {exam.examDate ? exam.examDate.split("T")[0] : ""}
            </h1>
            <h1 className=" text-xl mt-3">
              Exam end Date:{" "}
              {exam.examEndDate ? exam.examEndDate.split("T")[0] : ""}
            </h1>
          </div>
        </div>

        <div className=" border-solid border-2 w-1/2 p-3">
          <h1 className=" text-2xl">Attending Student List</h1>
          <ul>
            {enrolledStudents.map((student, index) => (
              <li
                key={index}
                className=" border-solid border-2 p-4 text-lg my-4"
              >
                <div className=" flex justify-between">
                  <h1>{student.userId}</h1>
                  <h1
                    className={
                      student.enrollStatus === "pending"
                        ? "font-bold text-red-500"
                        : "font-bold text-green-500"
                    }
                  >
                    {student.enrollStatus}
                  </h1>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className=" flex items-end justify-end gap-9 mx-10">
        <button
          className=" p-3 text-white bg-red-500 rounded-xl w-auto"
          onClick={handleEndExam}
        >
          End Exam
        </button>
        <button
          to={`/teacher/exam_overview/${examId}`}
          onClick={handleExamOverview}
          className=" p-3 text-white bg-blue-500 rounded-xl w-auto"
        >
          Exam Overview
        </button>
      </div>
    </div>
  );
}

export default MonitorExam;
