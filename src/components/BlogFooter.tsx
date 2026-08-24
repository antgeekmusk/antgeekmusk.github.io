import React from 'react';
import { Layout } from 'antd';
import { GithubOutlined, HeartFilled } from '@ant-design/icons';
import { URL } from "../common/GlobalConfig";
import '../styles/BlogFooter.css';

const { Footer } = Layout;

const BlogFooter: React.FC = () => {
    return (
        <Footer className="site-footer">
            <div className="footer-inner">
                <div className="footer-section footer-brand">
                    <span className="footer-logo">🐜 Antgeek</span>
                    <p className="footer-tagline">记录成长，分享足迹</p>
                </div>
                <div className="footer-section footer-links">
                    <a href="/" className="footer-link">博客</a>
                    <a href="/AboutMe" className="footer-link">足迹</a>
                    <a href="/Portfolio" className="footer-link">作品集</a>
                </div>
                <div className="footer-section footer-social">
                    <a href={URL.github} target="_blank" rel="noopener" className="footer-icon-link" title="GitHub">
                        <GithubOutlined />
                    </a>
                </div>
            </div>
            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} Antgeek — Built with <HeartFilled className="heart-icon" /> & React</span>
            </div>
        </Footer>
    );
};

export default BlogFooter;