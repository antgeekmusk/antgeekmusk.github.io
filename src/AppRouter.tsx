// AppRouter.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutMe from "./pages/AboutMe";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import BlogDetail from './pages/BlogDetail';
import { blogLoader } from './loaders/BlogLoader';


// 1. 使用createBrowserRouter替代Routes
const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/blog/:date/:id",
        loader: blogLoader,
        element: <BlogDetail />,
    },
    {
        path: "/AboutMe",
        element: <AboutMe />,
    },
    {
        path: "/404",
        element: <PageNotFound />,
    },
    {
        path: "*",
        element: <PageNotFound />,
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;