import ReactMarkdown, {Components} from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import React, { useState } from 'react';
import 'highlight.js/styles/atom-one-dark.css';
import CodeBlock from "./CodeBlock";
import remarkGfm from 'remark-gfm'; // 引入 GFM 插件
interface MarkdownRenderProps {
    markdown: string; // Define the type of the markdown prop
}

const MarkdownRender : React.FC<MarkdownRenderProps> = ({ markdown }) => {
    const getImgSrc = (src?: string) => {
        console.log('src',src)
        // 获取当前页面的path
        const path = window.location.pathname.split('/').slice(2,-1).join('/');
        console.log('path',path)
        const bath = '/data/blog/content/'
        return bath+path+'/'+src
    }
    const components: Components = {
        h1: ({children, ...props}) => (
            <h1 id={children?.toString() || ''}>
                {children}
            </h1>
        ),
        h2: ({children, ...props}) => (
            <h2 id={children?.toString() || ''}>
                {children}
            </h2>
        ),
        h3: ({children, ...props}) => (
            <h3 id={children?.toString() || ''}>
                {children}
            </h3>
        ),
        h4: ({children, ...props}) => (
            <h4 id={children?.toString() || ''}>
                {children}
            </h4>
        ),
        h5: ({children, ...props}) => (
            <h5 id={children?.toString() || ''}>
                {children}
            </h5>
        ),
        h6: ({children, ...props}) => (
            <h6 id={children?.toString() || ''}>
                {children}
            </h6>
        ),
        code: CodeBlock,
        a: ({ href, children, ...props }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                {children}
            </a>
        ),
        img: ({ src, alt, ...props }) => (
            <img src={getImgSrc(src)} alt={alt} style={{ display: "inline-block" }}></img>
        ),
        blockquote: ({ children, ...props }) => (
            <blockquote style={{ borderLeft: "4px solid #ccc", padding: "0 1em", color: "#666",margin: 0 }} {...props}>
                {children}
            </blockquote>
        ),


    };

    return (
        <ReactMarkdown
            rehypePlugins={[rehypeHighlight,remarkGfm]}  // 使用 rehype-highlight 插件
            children={markdown}
            components={components}
        />
    );
};

export default MarkdownRender;