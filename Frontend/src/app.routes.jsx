import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import AppLayout from "./components/AppLayout";
import ChatPage from "./features/interview/pages/ChatPage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                path: "login",
                element: <Login />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                index: true,
                element: <Protected><Home /></Protected>
            },
            {
                path: "interview/:interviewId",
                element: <Protected><Interview /></Protected>
            },
            {
                path: "chat",
                element: <Protected><ChatPage /></Protected>
            }
        ]
    }
])