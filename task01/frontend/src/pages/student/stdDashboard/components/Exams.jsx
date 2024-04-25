import React, { useState, useEffect } from "react";
import axios from "axios";
import LogoutButton from "./LogOut";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Exams() {
  const [examStatus, setExamstatus] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExamStatus, setFilteredExamstatus] = useState([]);
  const [userId, setUserId] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.userId);
    }

    const fetchExamsAndStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/exam/user/${userId}`
        );
        setExamstatus(
          response.data.map((exam) => ({
            ...exam,
            formattedDate: new Date(exam.examDate)
              .toLocaleDateString()
              .split("T")[0], // Formatting the date
            formattedEndDate: new Date(exam.examEndDate)
              .toLocaleDateString()
              .split("T")[0],
          }))
        );
        setFilteredExamstatus(
          response.data.map((exam) => ({
            ...exam,
            formattedDate: new Date(exam.examDate)
              .toLocaleDateString()
              .split("T")[0], // Formatting the date
            formattedEndDate: new Date(exam.examEndDate)
              .toLocaleDateString()
              .split("T")[0],
          }))
        );
      } catch (error) {
        console.log("no fetching exams and enrollment statuses:");
      }
    };

    fetchExamsAndStatus();
  }, [userId]);

  console.log(filteredExamStatus);

  const handleSearch = () => {
    filteredExamStatus(
      examStatus.filter((exam) =>
        exam.exam_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const handleExamClick = async (
    examId,
    formattedDate,
    formattedEndDate,
    examTime,
    duration,
    enrollStatus
  ) => {
    const currentDate = new Date().toLocaleDateString();
    const current = new Date();
    const currentTime =
      current.getHours() +
      ":" +
      current.getMinutes() +
      ":" +
      current.getSeconds();

    // Convert formattedDate to a Date object for comparison
    const examStartDate = formattedDate;
    const examEndDate = formattedEndDate;

    // Convert duration to days, hours, and minutes
    const newdays = Math.floor(duration / (24 * 60));
    const minutesToAdd = duration % (24 * 60);

    if (examTime) {
      // Find endExam time
      const [hours, minutes, seconds] = examTime.split(":").map(Number);
      const totalMinutes = hours * 60 + minutes + minutesToAdd;

      const newHours = Math.floor(totalMinutes / 60) % 24;
      const newMinutes = totalMinutes % 60;

      const examEndTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

      console.log(examTime + "& " + examEndTime);

      if (
        currentDate < examStartDate ||
        (currentDate === examStartDate && currentTime < examTime)
      ) {
        // Exam has not started yet
        alert("Exam has not started yet.");
        return;
      }
      if (
        (currentDate > examEndDate &&
          (enrollStatus === null || enrollStatus === "pending")) ||
        (currentDate === examEndDate &&
          (enrollStatus === null || enrollStatus === "pending") &&
          currentTime > examEndTime)
      ) {
        alert("Exam ended !");
        return;
      }
    }

    try {
      // Check if the user is already enrolled in the exam
      const response = await axios.get(
        `http://localhost:8000/examenroll/${userId}/${examId}`
      );

      const status = response.data;
      console.log(status);

      if (status.length == 0) {
        const confirmEnroll = window.confirm(
          "Are you sure you want to enroll in this exam?"
        );
        if (confirmEnroll) {
          enrollUser(examId);
        }
      }
      if (status[0].enrollStatus == "pending") {
        navigate(`/student/exam/${examId}`);
      }

      if (status[0].enrollStatus == "attended") {
        navigate(`/student/resultview/${examId}`);
      }
    } catch (error) {
      console.error("Error checking enrollment status:", error);
    }
  };

  const enrollUser = async (examId) => {
    try {
      await axios.post(`http://localhost:8000/examenroll/${userId}/${examId}`, {
        status: "pending",
      });

      navigate(`/student/exam/${examId}`);
    } catch (error) {
      console.error("Error enrolling in exam:", error);
    }
  };

  const convertTo12HourFormat = (timeString) => {
    if (!timeString) {
      return "";
    }

    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  return (
    <div className="flex flex-col h-screen w-screen items-center pt-16">
      <div className=" w-3/4">
        <div className=" flex w-full justify-between mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search Exam Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-solid border-2 p-2 "
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-blue-600 text-white rounded-lg"
            >
              Search
            </button>
          </div>

          <div className=" flex gap-6">
            <LogoutButton />
          </div>
        </div>

        <table className=" border-solid border-2 w-full">
          <thead className=" bg-blue-100">
            <tr>
              <th className=" border-solid border-2 p-5">Exam Name</th>
              <th className=" border-solid border-2">Start Date & Time</th>
              <th className=" border-solid border-2">Duration</th>
              <th className=" border-solid border-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredExamStatus.map((exam) => {
              const days = Math.floor(exam.duration / (24 * 60));
              const hours = Math.floor((exam.duration % (24 * 60)) / 60);
              const minutes = exam.duration % 60;

              return (
                <tr
                  key={exam.exam_id}
                  onClick={() =>
                    handleExamClick(
                      exam.exam_id,
                      exam.formattedDate,
                      exam.formattedEndDate,
                      exam.examTime,
                      exam.duration,
                      exam.enrollStatus
                    )
                  }
                  className="cursor-pointer hover:bg-slate-200"
                >
                  <td className="border-solid border-2 p-3">
                    {exam.exam_name}
                  </td>
                  <td className="border-solid border-2 p-3">
                    {exam.formattedDate}, {convertTo12HourFormat(exam.examTime)}
                  </td>
                  <td className="border-solid border-2 p-3">
                    {days > 0 && `${days}d `}
                    {hours > 0 && `${hours}h `}
                    {minutes > 0 && `${minutes}m`}
                  </td>
                  <td className="border-solid border-2 p-3">
                    {exam.enrollStatus}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Exams;
