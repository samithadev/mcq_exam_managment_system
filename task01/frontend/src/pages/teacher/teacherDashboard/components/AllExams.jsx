import React, { useState, useEffect } from "react";
import axios from "axios";
import LogoutButton from "./LogOut";
import { Link, useNavigate } from "react-router-dom";

function AllExams() {
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredExams, setFilteredExams] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/exam", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setExams(
          response.data.map((exam) => ({
            ...exam,
            // formattedDate: new Date(exam.examDate).toISOString().split("T")[0], // Formatting the date
            formattedDate: new Date(exam.examDate)
              .toLocaleDateString()
              .split("T")[0], // Formatting the date
          }))
        );
        setFilteredExams(
          response.data.map((exam) => ({
            ...exam,
            formattedDate: new Date(exam.examDate)
              .toLocaleDateString()
              .split("T")[0], // Formatting the date
          }))
        );
      } catch (error) {
        console.error("Error fetching exams:", error.response.data);
      }
    };

    fetchExams();
  }, []);

  const handleSearch = () => {
    setFilteredExams(
      exams.filter((exam) =>
        exam.exam_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const handleExamClick = (examId, status) => {
    if (status === "draft") {
      navigate(`/teacher/update_exam/${examId}`);
    } else {
      navigate(`/teacher/monitorexam/${examId}`);
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
            <button className="p-2 bg-green-300 text-white rounded-lg">
              <Link to="/teacher/create_exam">New Exam</Link>
            </button>
            <LogoutButton />
          </div>
        </div>

        <table className=" border-solid border-2 w-full">
          <thead className=" bg-blue-100">
            <tr>
              <th className=" border-solid border-2 p-5">Exam Name</th>
              <th className=" border-solid border-2">Start Date & Time</th>
              <th className=" border-solid border-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredExams.map((exam) => (
              <tr
                key={exam.exam_id}
                onClick={() => handleExamClick(exam.exam_id, exam.status)}
                className=" cursor-pointer hover:bg-slate-200"
              >
                <td className=" border-solid border-2 p-3">{exam.exam_name}</td>
                <td className=" border-solid border-2 p-3">
                  {exam.formattedDate}, {convertTo12HourFormat(exam.examTime)}
                </td>
                <td className=" border-solid border-2 p-3">{exam.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllExams;
