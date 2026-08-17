import React,{ useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Drawer, Button } from 'antd';
import { MenuOutlined,GithubOutlined,GlobalOutlined } from '@ant-design/icons';
import '../styles/BlogHeader.css'
import {URL} from '../common/GlobalConfig'

const { Header, Content} = Layout;

interface BlogHeaderProps {
    colorChangeFlag?: boolean; // 是否需要改变颜色 默认为true
}

const BlogHeader: React.FC<BlogHeaderProps> = ({colorChangeFlag = true}) => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [language, setLanguage] = useState('en');
    const navigate = useNavigate();
    // 头部样
    const headerStyle: React.CSSProperties = {
            position: 'fixed',
            textAlign: 'center',
            color: '#f000',
            height: 95,
            width: '100vw',
            backgroundColor: colorChangeFlag ? (scrollPosition>10 ? 'white' : 'transparent') : 'white',
            boxShadow: colorChangeFlag ? (scrollPosition>10 ? '0 2px 8px rgba(0,0,0,0.06)' : 'none') : '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'background-color 0.5s ease, box-shadow 0.5s ease',
            zIndex: 1000,
        };
    // 导航栏字体颜色
    const navFontStyle: React.CSSProperties = {
        color: colorChangeFlag ? (scrollPosition>0? 'black' : 'white') : "black",
    }
    // logo图片
    const logoImage = colorChangeFlag ? (scrollPosition > 0 ? 'logo.png' : 'logo-white.png') : 'logo.png';
    // 监听滚动事件
    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.pageYOffset || document.documentElement.scrollTop);
        };


        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    // logo点击事件
    const handleLogoClick = () => {
        navigate('/');
    };

    const handleGithubClick = () => {
        window.open(URL.github, '_blank');
    };

    const showDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const toggleLanguage = () => {
        setLanguage((prevLanguage) => (prevLanguage === 'en' ? 'zh' : 'en'));
    };

    const handleAboutMeClick = () => {
        navigate('/AboutMe');
    };

    const handlePortfolioClick = () => {
        navigate('/Portfolio');
    };

    return (
        <Header style={headerStyle}>
            <Content className={"header-content"}>
                {/*头像位置*/}
                <Content
                    className={"h-left"}
                    onClick={handleLogoClick}
                >
                    <div
                        className={"h-left-logo"}
                        style={{backgroundImage: `url(/${logoImage})`}}
                        >
                    </div>
                    <div
                        className={"h-left-text"}
                        style={{ marginLeft: '10px', fontSize: '24px', color: colorChangeFlag ? (scrollPosition > 0 ? 'black' : 'white') : 'black' }}>
                        Antgeek
                    </div>
                </Content>
                {/*导航栏*/}
                <Content className={"h-middle"}>
                    <ul>
                        <li style={navFontStyle} onClick={handleLogoClick}>博客</li>
                        <li style={navFontStyle} onClick={handleAboutMeClick}>关于我</li>
                        <li style={navFontStyle} onClick={handlePortfolioClick}>作品集</li>
                    </ul>
                </Content>
                {/*移动端导航栏*/}
                <Content className={"h-mobile-menu"}>
                    <Button size={"large"} className={"mobile-menu-button"} style={{color: `${colorChangeFlag ? (scrollPosition > 0 ? 'black' : 'white') : 'black'}`}} type="primary" icon={<MenuOutlined />} onClick={showDrawer} />
                    <Drawer
                        title="导航"
                        placement="right"
                        onClose={closeDrawer}
                        open={drawerVisible}
                    >
                        <div className={"h-mobile-menu-nav"}>
                            <p onClick={handleLogoClick}>博客</p>
                            <p onClick={handleAboutMeClick}>关于我</p>
                            <p onClick={handlePortfolioClick}>作品集</p>
                        </div>
                        <br/><br/><br/><br/>
                        <Button
                            icon={<GithubOutlined style={{ fontSize: '18px', margin: 0, padding: 0 }} />}
                            onClick={handleGithubClick}
                            style={{ marginLeft: '10px', border: 'none', background: 'none',margin: 0,padding: 0 }}
                        />
                        <Button
                            icon={<GlobalOutlined style={{ fontSize: '18px', margin: 0, padding: 0 }} />}
                            onClick={toggleLanguage}
                            style={{ marginLeft: '10px', border: 'none', background: 'none',margin: 0,padding: 0 }}
                        />
                    </Drawer>
                </Content>
                {/*联系方式*/}
                <Content className={"h-right"}>
                    <Button
                        icon={<GithubOutlined style={{ fontSize: '24px', margin: 0, padding: 0 }} />}
                        onClick={handleGithubClick}
                        style={{ marginLeft: '10px', border: 'none', background: 'none',margin: 0,padding: 0 }}
                    />
                    <Button
                        icon={<GlobalOutlined style={{ fontSize: '24px', margin: 0, padding: 0 }} />}
                        onClick={toggleLanguage}
                        style={{ marginLeft: '10px', border: 'none', background: 'none',margin: 0,padding: 0 }}
                    />
                </Content>
            </Content>
        </Header>
    );
};

export default BlogHeader;