import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import axios from "axios";

// Register additional chart components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

function ExamOverview() {
  const [enrollments, setEnrollments] = useState([]);
  const { id: examId } = useParams();
  const [data2, setData2] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const examEnrollments = async () => {
      try {
        const enrollments = await axios.get(
          `http://localhost:8000/examenroll/${examId}`
        );
        const fetchedEnrollments = enrollments.data;
        setEnrollments(fetchedEnrollments);
      } catch (error) {
        console.log("Error fetching data", error);
      }
    };

    examEnrollments();
  }, [examId]);

  // Calculate average point
  const totalPoints = enrollments.reduce((acc, curr) => acc + curr.points, 0);
  const averagePoint = totalPoints / enrollments.length;

  // Filter users with points higher than average
  const usersAboveAverage = enrollments.filter(
    (enrollment) => enrollment.points >= averagePoint
  );

  const usersBelowAverage = enrollments.filter(
    (enrollment) => enrollment.points < averagePoint
  );

  console.log(enrollments);

  const initialGradeCounts = { A: 0, B: 0, C: 0, F: 0 };

  const gradeCounts = enrollments.reduce((acc, curr) => {
    const grade = curr.grade.toUpperCase(); // Ensure the grade is considered in upper case
    if (acc.hasOwnProperty(grade)) {
      // Only count grades that are recognized
      acc[grade] += 1;
    }
    return acc;
  }, initialGradeCounts);

  // Calculate total students
  const totalStudents = enrollments.length;

  const gradePercentages = Object.keys(initialGradeCounts).map((grade) => {
    const count = gradeCounts[grade];
    return totalStudents > 0 ? (count / totalStudents) * 100 : 0;
  });

  const data1 = {
    datasets: [
      {
        data: gradePercentages,
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
    labels: Object.keys(initialGradeCounts), // Labels for the grades
  };

  //-----------------------------------------------------------------------------------------------
  const getMonthData = () => {
    const monthMap = {};

    console.log(enrollments);

    // Group data by month and aggregate
    enrollments.forEach((enrollment) => {
      if (enrollment.completeDate) {
        const month = enrollment.completeDate.substring(0, 7); // Assuming date is in 'YYYY-MM-DD' format
        if (!monthMap[month]) {
          monthMap[month] = {
            totalAttendees: 0,
            totalPoints: 0,
            count: 0,
          };
        }
        monthMap[month].totalAttendees += 1;
        monthMap[month].totalPoints += enrollment.points;
        monthMap[month].count += 1;
      }
    });
    console.log(monthMap);

    const months = Object.keys(monthMap).sort();
    const attendeesData = months.map((month) => monthMap[month].totalAttendees);
    const averagePointsData = months.map(
      (month) => monthMap[month].totalPoints / monthMap[month].count
    );
    console.log(monthMap);

    return { labels: months, attendeesData, averagePointsData };
  };
  //----------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      // Fetch and process data
      const { labels, attendeesData, averagePointsData } =
        getMonthData(enrollments);
      setData2({
        labels,
        datasets: [
          {
            label: "Number of Attendees",
            data: attendeesData,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
          {
            label: "Average Results",
            data: averagePointsData,
            fill: false,
            borderColor: "rgb(255, 99, 132)",
            tension: 0.1,
          },
        ],
      });
    };

    fetchData();
  }, [enrollments]);

  return (
    <div className="flex flex-col  justify-center w-screen mt-12 px-32">
      <Link
        to={`/teacher/monitorexam/${examId}`}
        className=" p-3 text-white bg-slate-500 rounded-xl w-min"
      >
        Back
      </Link>

      <div className=" ">
        <div className=" flex gap-5 my-5">
          <div className="flex flex-col items-center border-solid border-2 w-1/2 p-8">
            <h1 className=" text-xl">
              Attending and Results progress though Time
            </h1>
            <div className="w-[600px]">
              <Line data={data2} />
            </div>
          </div>
          <div className=" flex flex-col items-center border-solid border-2 w-1/2 p-8">
            <h1 className=" text-xl">Average Result Grade Percentages</h1>
            <div className="w-[300px]">
              <Doughnut data={data1} key="doughnut-chart" />
            </div>
          </div>
        </div>
        <div className=" flex gap-5 my-5">
          <div className=" border-solid border-2 w-1/2 p-8">
            <h1 className=" text-xl">Average Top Results Students</h1>

            <table className=" border-solid border-2 w-full mt-5">
              <thead className=" bg-blue-100">
                <tr>
                  <th className=" border-solid border-2 p-3">Student</th>
                  <th className=" border-solid border-2">Average</th>
                </tr>
              </thead>
              <tbody>
                {usersAboveAverage.map((user) => (
                  <tr key={user.userId} className=" cursor-pointer ">
                    <td className=" border-solid border-2 p-3">
                      {user.userId}
                    </td>
                    <td className=" border-solid border-2 p-3">
                      {user.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className=" border-solid border-2 w-1/2 p-8">
            <h1 className=" text-xl">Average Low Results Students</h1>

            <table className=" border-solid border-2 w-full mt-5">
              <thead className=" bg-blue-100">
                <tr>
                  <th className=" border-solid border-2 p-3">Student</th>
                  <th className=" border-solid border-2">Average</th>
                </tr>
              </thead>
              <tbody>
                {usersBelowAverage.map((user) => (
                  <tr key={user.userId} className=" cursor-pointer ">
                    <td className=" border-solid border-2 p-3">
                      {user.userId}
                    </td>
                    <td className=" border-solid border-2 p-3">
                      {user.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamOverview;
