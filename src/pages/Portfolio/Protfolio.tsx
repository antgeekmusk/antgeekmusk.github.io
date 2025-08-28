import React, { useEffect,useState } from 'react';
import { Timeline, Card, Row, Col, Layout, Tag, Select } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import BlogHeader from '../../components/BlogHeader';
import '../../styles/Portfolio.css';
import FloatButtonTools from "../../components/FloatButtonTools";
import BlogFooter from "../../components/BlogFooter";
import {getTagColor} from "../../utils/common";
import {useNavigate} from "react-router-dom";
const { Content } = Layout;
const { Option } = Select;
type PortfolioItem = {
    title: string;
    description: string;
    date: string;
    images?: string[];
    tags?: string[];
    emoji?: string; // Add emoji field
    route: string; // Add route field
};

type Portfolio = {
    year: string;
    items: PortfolioItem[];
};


const addBaseTag = () => {
    const base = document.createElement('base');
    base.target = '_blank';
    document.head.appendChild(base);
};
const Portfolio: React.FC = () => {
    const navigate = useNavigate();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [myInfo, setMyInfo] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    useEffect(() => {
        addBaseTag();
        // 获取portfolio数据
        fetch('/data/portfolio/portfolio.json')
            .then(response => response.json())
            .then(data => {
                setPortfolios(data);
                const tags = new Set<string>();
                data.forEach((portfolio : Portfolio) => {
                    portfolio.items.forEach(item => {
                        item.tags?.forEach(tag => tags.add(tag));
                    });
                });
                setAllTags(Array.from(tags));
            });
        // 获取我的介绍
        fetch('/data/portfolio/myInfo.md')
            .then(response => response.text())
            .then(text => setMyInfo(text));
    }, []);

    const handleTagChange = (value: string) => {
        setSelectedTag(value);
    };

    const filteredPortfolios = selectedTag
        ? portfolios.map(portfolio => ({
            ...portfolio,
            items: portfolio.items.filter(item => item.tags?.includes(selectedTag))
        })).filter(portfolio => portfolio.items.length > 0)
        : portfolios;

    const handleCardClick = (route:string) => {
        navigate('/Portfolio'+route);
    }

    return (
        <Layout>
            <BlogHeader colorChangeFlag={false}/>
            <Content className="portfolio">
                <div className="self-introduction">
                    <h1>我的介绍</h1>
                    <ReactMarkdown>
                        {myInfo}
                    </ReactMarkdown>
                </div>
                <div className="portfolio-wall">

                    <Select
                        style={{width: 200, marginBottom: 20}}
                        placeholder="选择标签"
                        onChange={handleTagChange}
                        allowClear
                    >
                        {allTags.map(tag => (
                            <Option key={tag} value={tag}>
                                {tag}
                            </Option>
                        ))}
                    </Select>
                    <h2>
                        <img src="/images/gif/feather.gif" style={{width: '50px', height: '50px'}}/>
                    </h2>
                    <Timeline>
                        {filteredPortfolios.map((portfolio) => (
                            <Timeline.Item key={portfolio.year}>
                                <h3>{portfolio.year}</h3>
                                <Row gutter={[16, 16]}>
                                    {portfolio.items.map((item, index) => (
                                        <Col key={index} span={8}>
                                            <Card className="portfolio-card"
                                                  title={<span>{item.emoji} {item.title}</span>}
                                                  bordered={false}
                                                  onClick={() => handleCardClick(item.route)}
                                            >
                                                <div>
                                                    {item.tags && item.tags.map((tag, idx) => (
                                                        <Tag key={idx} color={getTagColor(tag)}
                                                             bordered={false}>{tag}</Tag>
                                                    ))}
                                                </div>
                                                <p>
                                                    <CalendarOutlined/> {item.date}
                                                </p>
                                                <ReactMarkdown>{item.description}</ReactMarkdown>
                                                {item.images && item.images.length > 0 && (
                                                    <div className="portfolio-images">
                                                        {item.images.map((image, idx) => (
                                                            <img key={idx} src={image}
                                                                 alt={`portfolio ${index + 1} Image ${idx + 1}`}/>
                                                        ))}
                                                    </div>
                                                )}


                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </div>
            </Content>
            <FloatButtonTools/>
            <BlogFooter/>
        </Layout>
    )
}
export default Portfolio;