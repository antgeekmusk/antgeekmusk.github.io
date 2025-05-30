import React,{ useEffect, useState } from 'react';
import { Flex, Layout } from 'antd';
import BlogHeader from "../components/BlogHeader";
import BlogFooter from "../components/BlogFooter";
import '../styles/HomePage.css'
import BlogList from "../components/BlogList";
import Sidebar from "../components/Sidebar/Sidebar";
import FloatButtonTools from '../components/FloatButtonTools';
import Announcement from "../components/Sidebar/item/Announcement";
import MyGithubCalendar from "../components/GithubCalendar/MyGithubCalendar";
import SidebarColumn from "../components/Sidebar/item/SidebarColumn";

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
                            <Sidebar
                                components={[
                                    { component: <Announcement />, sticky: false , order: 1},
                                    { component: <MyGithubCalendar />, sticky: false, order: 2 },
                                    { component: <SidebarColumn />, sticky: true ,order: 3},
                                ]}
                            />
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