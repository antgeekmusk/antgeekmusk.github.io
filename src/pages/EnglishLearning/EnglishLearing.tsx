import React, { useEffect,useState } from 'react';
import {Timeline, Card, Row, Col, Layout, Tag, Select, TimelineItemProps} from 'antd';
import BlogHeader from '../../components/BlogHeader';
import '../../styles/AboutMe.css';
import FloatButtonTools from "../../components/FloatButtonTools";
import BlogFooter from "../../components/BlogFooter";
const { Content } = Layout;
const EnglishLearning: React.FC = () => {
    const [words, setWords] = useState<TimelineItemProps[]>([]);
    useEffect(() => {
        // 获取学习数据
        fetch('/data/english_learning/words.json')
            .then(response => response.json())
            .then(data => {
                setWords(data);
            });
    }, []);

    return (
        <Layout>
            <BlogHeader colorChaneFlag={false}/>
            <Content className="about-me">
                <div className="achievement-wall">
                    <h2>
                        <img src="/images/gif/feather.gif" style={{width: '50px', height: '50px'}}/>
                    </h2>
                    <Timeline
                        items={words}
                    >
                    </Timeline>
                </div>
            </Content>
            <FloatButtonTools/>
            <BlogFooter/>
        </Layout>
    );
};

export default EnglishLearning;