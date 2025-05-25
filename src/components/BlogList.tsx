import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BlogList.css';
import { Tag } from 'antd';
import { getTagColor } from '../utils/common';

const BlogList: React.FC = () => {
    const navigate = useNavigate();
    const [blogs,setBlogs] = useState<any[]>([]);

    // 获取到博客配置信息
    useEffect(() => {
        fetch('/data/blog/blogs_config.json')
            .then(resp => resp.json())
            .then(data => {
                setBlogs(data)
            })
    }, []);

    const handleBlogClick = (blog: any) => {
        navigate(`/blog${blog.path.replace('.md','')}`,{state: {blog}});
    };

    const processTitle = (title:string) => {
        if (title.length > 10){
            return (
                <>
                {title.slice(0,10)}
                    <br/>
                {
                    title.slice(10).length>12 ? `${title.slice(10)}...` : title.slice(10)
                }
                </>
            )
        } else {
            return title;
        }
    }

    return (
        <div className="blog-list">
            {blogs.map((blog) => (
                <div key={blog.id} className="blog-item" onClick={() => handleBlogClick(blog)}>
                    {/*列表元素简略图*/}
                    <div className="blog-image-container">
                        {blog.image ? (
                            <div className="blog-image" style={{ backgroundImage: `url(${blog.image})` }}></div>
                        ) : (
                            <div
                                className="blog-image-text"
                                style={{
                                    backgroundColor: '#e6f7ff',
                                    color: '#1890ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    borderRadius: '5px',
                                    boxSizing: 'border-box',
                                    overflow: 'hidden',
                                    wordBreak: 'break-word',
                                    fontSize: '1.2rem',
                                }}
                            >
                                {processTitle(blog.image_text)}
                            </div>
                        )}
                    </div>
                    <div className="blog-content">
                        <h2>{blog.title}</h2>
                        <div className="blog-meta">
                            <span >发表于 : {blog.date}</span>
                            <div>
                                <span>专栏 :  </span>
                                {blog.columns.map((column: string) => (
                                    <Tag className={"blog-meta-tag"} key={column} color={getTagColor(column)}>{column}</Tag>
                                ))}
                            </div>
                            <div className="blog-tags">
                                <span>标签 : </span>
                                {blog.tags.map((tag: string) => (
                                    <Tag className={"blog-meta-tag"} key={tag} color={getTagColor(tag)}>
                                        {tag}
                                    </Tag>
                                ))}
                            </div>
                        </div>
                        <p>{blog.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BlogList;