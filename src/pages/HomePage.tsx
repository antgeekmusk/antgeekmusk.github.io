import React,{ useEffect, useState } from 'react';
import { Flex, Layout } from 'antd';
import BlogHeader from "../components/BlogHeader";
import BlogFooter from "../components/BlogFooter";
import '../styles/HomePage.css'
import BlogList from "../components/BlogList";
import Sidebar from "../components/Sidebar";
import FloatButtonTools from '../components/FloatButtonTools';

const { Content } = Layout;


const layoutStyle = {
    overflow: 'hidden',
    width: '100vw',
    maxWidth: '100vw',
};

interface HomePageProps {
    // 这里暂时没有额外需要传入的属性，可按需添加，比如是否显示搜索框等功能相关属性
}

const HomePage: React.FC<HomePageProps> = ({}) => {
    return (
        <Flex gap="middle" wrap>
            <Layout style={layoutStyle}>
                <BlogHeader />
                <Layout>
                    <Content className={"homepage-banner"}>
                        <div>
                            <p style={{fontSize: 28}}>LIVE AND LEARN</p>
                            <p style={{fontSize: 19}}>antgeek's blog</p>
                        </div>
                    </Content>
                    <Content className={"homepage-content"}>
                        <div className="content-container">
                            <BlogList />
                            <Sidebar showGithubCalender={true}/>
                        </div>
                    </Content>
                </Layout>
                <FloatButtonTools BackTopButton={true} />
                <BlogFooter />
            </Layout>
        </Flex>
    );
};

export default HomePage;