import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BlogList.css';
import { Tag } from 'antd';
import { getTagColor } from '../utils/common';
interface BlogListProps {
    columnName?:string
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
const BlogList: React.FC<BlogListProps> = ({columnName = ''}) => {
    const navigate = useNavigate();
    const [blogs,setBlogs] = useState<any[]>([]);

    // 获取到博客配置信息
    useEffect(() => {
        fetch('/data/blog/blogs_config.json')
            .then(resp => resp.json())
            .then((data:Blog[]) => {
                // 判断是否有筛选
                if(columnName){
                    data = data.filter(blog => blog.columns.includes(columnName));
                }
                setBlogs(data)

            })
    }, [columnName]);

    const handleBlogClick = (blog: any) => {
        const blogPathPrefix = blog.path.split('/').slice(0, 3).join('/');
        navigate(`/blog${blogPathPrefix}`,{state: {blog}});
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