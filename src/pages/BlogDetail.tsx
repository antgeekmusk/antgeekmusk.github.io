import React, {useEffect, useState, useLayoutEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import { Layout, Tag, Typography } from 'antd';
import BlogHeader from '../components/BlogHeader';
import '../styles/BlogDetail.css';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import FloatButtonTools from "../components/FloatButtonTools";
import BlogFooter from "../components/BlogFooter";
import Sidebar from '../components/Sidebar/Sidebar';
import { useLocation } from 'react-router-dom';
import {getTagColor} from "../utils/common";
import MarkdownRender from "../components/MarkdownRender/MarkdownRender";
import { Button, Drawer } from 'antd';
import Loading from "../components/Loading/Loading";
import Categories from "../components/Sidebar/item/Categories";
import Announcement from '../components/Sidebar/item/Announcement';
import MyGithubCalendar from "../components/GithubCalendar/MyGithubCalendar";
import SidebarColumn from "../components/Sidebar/item/SidebarColumn";

const { Content } = Layout;
const { Title, Text } = Typography;

interface OutlineItem {
    level: number;
    text: string;
}

const BlogDetail: React.FC = () => {
    const { id,date } = useParams<{ id: string,date: string }>();
    const location = useLocation();
    // 博客整体内容
    const [blog, setBlog] = useState<any>(null);
    // 文章内容
    const [content, setContent] = useState<string>('');
    //大纲
    const [outline, setOutline] = useState<OutlineItem[]>([]);
    // 侧边栏是否可见
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    // 文章字数
    const [wordCount, setWordCount] = useState(0);
    // 文章阅读时间
    const [readTime, setReadTime] = useState(0);
    // 是否是手机端
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const navigate = useNavigate();


    // 判断是否是手机端
    const isMobile = () => {
        return /Mobi|Android|iPhone/i.test(window.navigator.userAgent) || window.innerWidth <= 768;
    };

    // 影藏显示侧边栏
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    // 提取文章大纲
    const getBlogOutline = (markdown: string): OutlineItem[] => {
        const outline: OutlineItem[] = [];
        const tree = unified().use(remarkParse).parse(markdown);

        visit(tree, 'heading', (node: any) => {
            const level = node.depth; // Heading level (1-6)
            const text = node.children
                .filter((child: any) => child.type === 'text')
                .map((child: any) => child.value)
                .join('');
            outline.push({ level, text });
        });

        return outline;
    };


    // 获取文章的唯一标识
    const getBlogStorageId = (blogId: string ,blogDate: string) => {
        return `blogStorageId-${blogId}-${blogDate}`;
    }

    // 非法路径拦截
    useLayoutEffect(() => {
        fetch('/data/blog/blogs_config.json')
            .then(resp => resp.json())
            .then(data => {
                const matchedBlog = data.find((b: any) => {
                    const pathSegments = b.path.split('/'); // Split the path by '/'
                    const extractedDate = pathSegments[1]; // Extract the date (second segment)
                    const extractedId = pathSegments[2]; // Extract the id (third segment)
                    return extractedDate === date && extractedId === id; // Match with URL params
                });
                if(!matchedBlog){
                    navigate('/404')
                }
            })
            .catch(e => {
                navigate('/404')
            })
    }, [id,date]);

    // 存储列表页传来的blog参数
    useEffect(() => {
    if (location.state?.blog) {
        setBlog(location.state.blog);
        localStorage.setItem(getBlogStorageId(id ?? '',date ?? ''), JSON.stringify(location.state.blog)); // 存储到 localStorage
    } else {
        const savedBlog = localStorage.getItem(getBlogStorageId(id ?? '',date ?? ''));
        if (savedBlog) {
            setBlog(JSON.parse(savedBlog)); // 从 localStorage 恢复数据
        } else {
            fetch('/data/blog/blogs_config.json')
                .then(resp => resp.json())
                .then(data => {
                    // 查找匹配的博客
                    data.forEach((blog: any) => {
                        if(blog['id'] == id){
                            setBlog(blog);
                            localStorage.setItem(getBlogStorageId(id ?? '',date ?? ''), JSON.stringify(blog)); // 存储到 localStorage
                        }
                    })
                })

        }
    }
    }, [location.state]);

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            setIsMobileDevice(isMobile());
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // 初始化检查

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 获取博客文章
    useEffect(() => {
        if (blog?.path) {
            const fullPath = `/data/blog/content${blog.path.startsWith('/') ? blog.path : `/${blog.path}`}`;
            fetch(fullPath)
                .then((response) => response.text())
                .then((data) => {
                    setContent(data)
                    // 提取大纲
                    setOutline(getBlogOutline(data));
                    // 获取文章阅读时间和字数
                    const { wordCount, readTime } = getWordCountAndReadTime(data);
                    setWordCount(wordCount);
                    setReadTime(readTime);
                })
                .catch((error) => console.error('Error fetching blog content:', error));

        }
    }, [blog?.path]);

    // 获取文章的字数以及预估阅读时间
    const getWordCountAndReadTime = (text: string) => {
        // 只统计中文和英文的字数
        const wordCount = (text.match(/[\u4e00-\u9fa5a-zA-Z]/g) || []).length;
        const readTime = Math.ceil(wordCount / 300); // Assuming an average reading speed of 200 words per minute
        return { wordCount, readTime };
    };

    // 页面加载时滚动到顶部
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    return (
        <Layout className={"blog-detail"}>
            {/*博客头部*/}
            <BlogHeader colorChaneFlag={false}/>
            {/*博客内容*/}
            <Content className="blog-detail-container">
                {blog ? (
                    <div className="blog-detail-content">
                        <Title level={1} style={{textAlign: "center"}}>{blog.title}</Title>
                        <div className="blog-meta">
                            <span>发表于 : {blog.date}</span>
                            <div>
                                <span>标签 :  </span>
                                {blog.tags.map((tag: string) => (
                                    <Tag className={"blog-meta-tag"} key={tag} color={getTagColor(tag)}>{tag}</Tag>
                                ))}
                            </div>
                            <div>
                                <span>专栏 :  </span>
                                {blog.columns.map((column: string) => (
                                    <Tag className={"blog-meta-tag"} key={column} color={getTagColor(column)}>{column}</Tag>
                                ))}
                            </div>
                        </div>

                        <div style={{color: '#888', fontSize: '14px', marginTop: '5px', marginBottom: '15px'}}>
                            阅读字数: {wordCount} 字 | 预估阅读时间: {readTime} 分钟
                        </div>


                        <div className="blog-body">
                            <Categories outline={outline} isDetailOutline={true} />
                            <MarkdownRender markdown={content}/>
                        </div>
                    </div>
                ) : (
                    <div className="blog-detail-content">
                        <Loading/>
                    </div>
                )
                }

                {
                    isSidebarVisible &&
                    <Sidebar
                        components={[
                            { component: <Announcement />, sticky: false,order: 1 },
                            { component: <SidebarColumn />, sticky: false, order: 3 },
                            { component: <Categories outline={outline} isDetailOutline={false} />, sticky: true, order: 4 },
                            { component: <MyGithubCalendar />, sticky: false, order: 5 },

                        ]}
                    />
                }
            </Content>
            {/*返回顶部按钮*/}
            <FloatButtonTools
                BackTopButton={true}
                SidebarVisibleButton={!isMobileDevice}
                SidebarOnClick={toggleSidebar}
                SidebarVisible={isSidebarVisible}
            />

            {/*博客底部*/}
            <BlogFooter/>
        </Layout>
    );
};

export default BlogDetail;