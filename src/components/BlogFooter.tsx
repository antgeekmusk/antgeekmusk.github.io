import React from 'react';
import { Layout } from 'antd';
import {URL} from "../common/GlobalConfig"
import {rgba} from "framer-motion";
const { Footer: Footer} = Layout;
const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'black',
    backgroundColor: 'rgb(242,242,242)',

};
const BlogFooter: React.FC = () => {
    return (
        <Footer style={footerStyle}>
            Copyright by <a href={URL.github} target="_blank">Antgeek</a>
        </Footer>
    );
};

export default BlogFooter;