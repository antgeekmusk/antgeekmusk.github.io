import React from 'react';
import { Routes, Route } from 'react-router-dom';
import BlogDetail from './pages/BlogDetail';
import HomePage from './pages/HomePage';
import AboutMe from "./pages/AboutMe";
import PageNotFound from "./pages/PageNotFound/PageNotFound";

const AppRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog/:date/:id" element={<BlogDetail />} />
            <Route path="/AboutMe" element={<AboutMe />} />
            <Route path="/404" element={<PageNotFound />} />
            <Route path="*" element={<PageNotFound />} />
        </Routes>
    );
};

export default AppRouter;