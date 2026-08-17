import React, { useEffect,useState } from 'react';
import { Timeline, Card, Row, Col, Layout, Tag, Select, Modal } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import BlogHeader from '../../components/BlogHeader';
import '../../styles/AboutMe.css';
import FloatButtonTools from "../../components/FloatButtonTools";
import BlogFooter from "../../components/BlogFooter";
import {getTagColor} from "../../utils/common";
const { Content } = Layout;
const { Option } = Select;
type AchievementItem = {
    title: string;
    description: string;
    date: string;
    images?: string[];
    tags?: string[];
    emoji?: string;
};

type Achievement = {
    year: string;
    items: AchievementItem[];
};

/** 截断长文本：保留前 maxLen 个字符，超出加 … */
const truncate = (text: string, maxLen: number): string =>
    text.length > maxLen ? text.substring(0, maxLen) + '…' : text;

const addBaseTag = () => {
    const base = document.createElement('base');
    base.target = '_blank';
    document.head.appendChild(base);
};
const AboutMe: React.FC = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [myInfo, setMyInfo] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    // 详情弹窗状态
    const [detailItem, setDetailItem] = useState<AchievementItem | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    useEffect(() => {
        addBaseTag();
        // 获取achievement数据
        fetch('/data/achievement/achievement.json')
            .then(response => response.json())
            .then(data => {
                setAchievements(data);
                const tags = new Set<string>();
                data.forEach((achievement : Achievement) => {
                    achievement.items.forEach(item => {
                        item.tags?.forEach(tag => tags.add(tag));
                    });
                });
                setAllTags(Array.from(tags));
            });
        // 获取我的介绍
        fetch('/data/achievement/myInfo.md')
            .then(response => response.text())
            .then(text => setMyInfo(text));
    }, []);

    const handleTagChange = (value: string) => {
        setSelectedTag(value);
    };

    const openDetail = (item: AchievementItem) => {
        setDetailItem(item);
        setDetailVisible(true);
    };

    const filteredAchievements = selectedTag
        ? achievements.map(achievement => ({
            ...achievement,
            items: achievement.items.filter(item => item.tags?.includes(selectedTag))
        })).filter(achievement => achievement.items.length > 0)
        : achievements;

    return (
        <Layout>
            <BlogHeader colorChangeFlag={false}/>
            <Content className="about-me">
                <div className="self-introduction">
                    <h1>我的介绍</h1>
                    <ReactMarkdown>
                        {myInfo}
                    </ReactMarkdown>
                </div>
                <div className="achievement-wall">

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
                        {filteredAchievements.map((achievement) => (
                            <Timeline.Item key={achievement.year}>
                                <h3>{achievement.year}</h3>
                                <Row gutter={[16, 16]}>
                                    {achievement.items.map((item, index) => (
                                        <Col key={index} span={8}>
                                            <Card className="achievement-card"
                                                  hoverable
                                                  onClick={() => openDetail(item)}
                                                  title={
                                                <span>{item.emoji} {item.title}</span>} bordered={false}>
                                                <div>
                                                    {item.tags && item.tags.map((tag, idx) => (
                                                        <Tag key={idx} color={getTagColor(tag)}
                                                             bordered={false}>{tag}</Tag>
                                                    ))}
                                                </div>
                                                <p>
                                                    <CalendarOutlined/> {item.date}
                                                </p>
                                                <ReactMarkdown>{truncate(item.description, 80)}</ReactMarkdown>
                                                {item.images && item.images.length > 0 && (
                                                    <div className="achievement-images">
                                                        <div className="achievement-image-wrapper">
                                                            <img src={item.images[0]}
                                                                 alt={`${item.title} 图片`}/>
                                                            {item.images.length > 1 && (
                                                                <div className="image-overlay">
                                                                    <PlusOutlined/> {item.images.length - 1}
                                                                </div>
                                                            )}
                                                        </div>
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

                {/* 详情弹窗 */}
                <Modal
                    title={detailItem ? `${detailItem.emoji} ${detailItem.title}` : ''}
                    open={detailVisible}
                    onCancel={() => setDetailVisible(false)}
                    footer={null}
                    width={720}
                    centered
                >
                    {detailItem && (
                        <div className="detail-modal-body">
                            <div className="detail-meta">
                                {detailItem.tags && detailItem.tags.map((tag, idx) => (
                                    <Tag key={idx} color={getTagColor(tag)} bordered={false}>{tag}</Tag>
                                ))}
                                <span className="detail-date"><CalendarOutlined/> {detailItem.date}</span>
                            </div>
                            <div className="detail-description">
                                <ReactMarkdown>{detailItem.description}</ReactMarkdown>
                            </div>
                            {detailItem.images && detailItem.images.length > 0 && (
                                <div className="detail-images">
                                    {detailItem.images.map((img, idx) => (
                                        <img key={idx} src={img} alt={`${detailItem.title} 图片 ${idx + 1}`}/>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </Content>
            <FloatButtonTools/>
            <BlogFooter/>
        </Layout>
    );
};

export default AboutMe;