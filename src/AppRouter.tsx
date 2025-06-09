// AppRouter.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import AboutMe from "./pages/AboutMe/AboutMe";
import PageNotFound from "./pages/PageNotFound/PageNotFound";
import BlogDetail from './pages/BlogDetail/BlogDetail';
import { blogLoader } from './loaders/BlogLoader';
import EnglishLearning from "./pages/EnglishLearning/EnglishLearing";
import {ColumnLoader} from "./loaders/ColumnLoader";


// 1. 使用createBrowserRouter替代Routes
const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />, // 首页
    },
    {
        path: "/column/:columnName",
        loader: ColumnLoader, // 拦截非法访问
        element: <HomePage />, // 查看某些专栏的数据
    },
    {
        path: "/blog/:date/:id",
        loader: blogLoader,
        element: <BlogDetail />, // 文章详情页
    },
    {
        path: "/AboutMe",
        element: <AboutMe />, // 关于我页面
    },
    {
        path: "/EnglishLearning",
        element: <EnglishLearning />, // 英语学习页面
    },
    {
        path: "/404",
        element: <PageNotFound />, // 404页面
    },
    {
        path: "*",
        element: <PageNotFound />, // 捕获所有未匹配的路径
    },
]);

const AppRouter = () => {
    return <RouterProvider router={router} />;
};

export default AppRouter;