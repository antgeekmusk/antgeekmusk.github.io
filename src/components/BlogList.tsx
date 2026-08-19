import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BlogList.css';
import { Tag, Pagination } from 'antd';
import { getTagColor } from '../utils/common';

const PAGE_SIZE = 10;

interface BlogListProps {
    columnName?: string;
}

interface Blog {
    id: string;
    path: string;
    image?: string;
    image_text?: string;
    title: string;
    date: string;
    columns: string[];
    tags: string[];
    description: string;
}

const BlogList: React.FC<BlogListProps> = ({ columnName = '' }) => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        fetch('/data/blog/blogs_config.json')
            .then(resp => resp.json())
            .then((data: Blog[]) => {
                if (columnName) {
                    data = data.filter(blog => blog.columns.includes(columnName));
                }
                setBlogs(data);
                setCurrentPage(1); // 切换专栏时回到第一页
            });
    }, [columnName]);

    const paginatedBlogs = blogs.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // 滚动入场动画
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();
        const timer = setTimeout(() => {
            const items = document.querySelectorAll('.blog-item');
            if (!items.length) return;
            observerRef.current = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('item-visible');
                        observerRef.current?.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '0px 0px -30px 0px', threshold: 0.08 });
            items.forEach((el, i) => {
                (el as HTMLElement).style.transitionDelay = `${i * 50}ms`;
                observerRef.current?.observe(el);
            });
        }, 100);
        return () => { clearTimeout(timer); observerRef.current?.disconnect(); };
    }, [paginatedBlogs]); // 依赖分页后的列表

    const handleBlogClick = (blog: any) => {
        const blogPathPrefix = blog.path.split('/').slice(0, 3).join('/');
        navigate(`/blog${blogPathPrefix}`, { state: { blog } });
    };

    const processTitle = (title: string) => {
        if (title.length > 10) {
            return (
                <>
                    {title.slice(0, 10)}
                    <br/>
                    {title.slice(10).length > 12 ? `${title.slice(10, 22)}...` : title.slice(10)}
                </>
            );
        }
        return title;
    };

    if (!blogs.length) {
        return <div className="blog-list"><div className="blog-empty">暂无文章</div></div>;
    }

    return (
        <div className="blog-list">
            {paginatedBlogs.map((blog) => (
                <div key={blog.id} className="blog-item" onClick={() => handleBlogClick(blog)}>
                    <div className="blog-image-container">
                        {blog.image ? (
                            <div className="blog-image" style={{ backgroundImage: `url(${blog.image})` }}>
                                <div className="blog-image-shine"/>
                            </div>
                        ) : (
                            <div className="blog-image-text">
                                <span>{blog.image_text || blog.title.slice(0, 6)}</span>
                            </div>
                        )}
                    </div>
                    <div className="blog-content">
                        <h2 className="blog-title">{blog.title}</h2>
                        <div className="blog-meta">
                            <span className="blog-date">📅 {blog.date}</span>
                            <div className="blog-columns">
                                {blog.columns.map((column: string) => (
                                    <Tag className="blog-meta-tag" key={column} color={getTagColor(column)}>{column}</Tag>
                                ))}
                            </div>
                        </div>
                        <div className="blog-tags">
                            {blog.tags.map((tag: string) => (
                                <Tag className="blog-meta-tag" key={tag} color={getTagColor(tag)}>{tag}</Tag>
                            ))}
                        </div>
                        <p className="blog-desc">{blog.description}</p>
                    </div>
                </div>
            ))}

            <Pagination
                className="blog-pagination"
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={blogs.length}
                onChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                showSizeChanger={false}
                showTotal={(total) => `共 ${total} 篇文章`}
            />
        </div>
    );
};

export default BlogList;