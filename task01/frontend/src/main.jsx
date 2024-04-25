import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import RootLayout from "./layouts/root.layout";
import RegisterPage from "./pages/register/register.page";
import LoginPage from "./pages/login/login.page";
import StudentDash from "./pages/student/stdDashboard/studentDash.page";
import TeacherDash from "./pages/teacher/teacherDashboard/teacherDash.page";
import StudentLayout from "./layouts/student.layout";
import TeacherLayout from "./layouts/teacher.layout";
import CreateExamPage from "./pages/teacher/createExam/createExam.page";
import ExamViewPage from "./pages/student/examView/examView.page";
import Exams from "./pages/student/stdDashboard/components/Exams";
import MonitorExamPage from "./pages/teacher/monitorExam/monitorExam.page";
import ResultViewPage from "./pages/student/resultView/resultView.page";
import UpdateExamPage from "./pages/teacher/updateExam/updateExam.page";
import ExamOverviewPage from "./pages/teacher/examOverview/examOverview.page";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/",
        element: <LoginPage />,
      },
      {
        path: "student",
        element: <StudentLayout />,
        children: [
          {
            path: "dashboard",
            element: <StudentDash />,
          },
          {
            path: "exam/:id",
            element: <ExamViewPage />,
          },
          {
            path: "resultview/:id",
            element: <ResultViewPage />,
          },
        ],
      },
      {
        path: "teacher",
        element: <TeacherLayout />,
        children: [
          {
            path: "dashboard",
            element: <TeacherDash />,
          },
          {
            path: "create_exam",
            element: <CreateExamPage />,
          },
          {
            path: "update_exam/:id",
            element: <UpdateExamPage />,
          },
          {
            path: "monitorexam/:id",
            element: <MonitorExamPage />,
          },
          {
            path: "exam_overview/:id",
            element: <ExamOverviewPage />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
