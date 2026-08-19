import React, { useEffect, useState, useRef } from 'react';
import { Timeline, Card, Row, Col, Layout, Tag, Select, Modal } from 'antd';
import { CalendarOutlined, PlusOutlined, EnvironmentOutlined } from '@ant-design/icons';
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
    const [detailItem, setDetailItem] = useState<AchievementItem | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const wallRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        addBaseTag();
        fetch('/data/achievement/achievement.json')
            .then(response => response.json())
            .then(data => {
                setAchievements(data);
                const tags = new Set<string>();
                data.forEach((achievement: Achievement) => {
                    achievement.items.forEach(item => {
                        item.tags?.forEach(tag => tags.add(tag));
                    });
                });
                setAllTags(Array.from(tags));
            });
        fetch('/data/achievement/myInfo.md')
            .then(response => response.text())
            .then(text => setMyInfo(text));
    }, []);

    const filteredAchievements = selectedTag
        ? achievements.map(achievement => ({
            ...achievement,
            items: achievement.items.filter(item => item.tags?.includes(selectedTag))
        })).filter(achievement => achievement.items.length > 0)
        : achievements;

    // 滚动出现动画 —— 筛选变化时重新观察
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();
        const timer = setTimeout(() => {
            const cards = document.querySelectorAll('.achievement-card');
            if (!cards.length) return;
            observerRef.current = new IntersectionObserver((entries) => {
                entries.forEach((_entry, idx) => {
                    const el = _entry.target as HTMLElement;
                    if (_entry.isIntersecting) {
                        const col = el.parentElement; // Col
                        const row = col?.parentElement; // Row
                        const cols = row ? Array.from(row.children) : [];
                        const delay = cols.indexOf(col as Element) * 60;
                        setTimeout(() => el.classList.add('card-visible'), delay);
                        observerRef.current?.unobserve(el);
                    }
                });
            }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
            cards.forEach(c => observerRef.current?.observe(c));
        }, 100);
        return () => { clearTimeout(timer); observerRef.current?.disconnect(); };
    }, [filteredAchievements]);

    const handleTagChange = (value: string) => setSelectedTag(value);

    const openDetail = (item: AchievementItem) => {
        setDetailItem(item);
        setDetailVisible(true);
    };

    return (
        <Layout>
            <BlogHeader colorChangeFlag={false}/>
            <Content className="about-me">
                {/* 装饰浮动光斑 */}
                <div className="bg-blob bg-blob-1"/>
                <div className="bg-blob bg-blob-2"/>

                <div className="self-introduction">
                    <h1>我的介绍</h1>
                    <ReactMarkdown>{myInfo}</ReactMarkdown>
                </div>

                <div className="achievement-wall" ref={wallRef}>
                    <div className="wall-header">
                        <h1 className="wall-title">
                            <EnvironmentOutlined className="title-icon"/> 我的足迹
                        </h1>
                        <Select
                            style={{width: 200}}
                            placeholder="筛选标签"
                            onChange={handleTagChange}
                            allowClear
                        >
                            {allTags.map(tag => (
                                <Option key={tag} value={tag}>{tag}</Option>
                            ))}
                        </Select>
                    </div>

                    <Timeline>
                        {filteredAchievements.map((achievement) => (
                            <Timeline.Item key={achievement.year}
                                           dot={<span className="timeline-dot"><span className="dot-inner"/></span>}>
                                <h3 className="achievement-year">{achievement.year}</h3>
                                <Row gutter={[16, 16]}>
                                    {achievement.items.map((item, index) => (
                                        <Col key={index} span={8}>
                                            <Card className="achievement-card" hoverable
                                                  onClick={() => openDetail(item)}
                                                  title={<span>{item.emoji} {item.title}</span>}
                                                  bordered={false}>
                                                <div className="card-tags">
                                                    {item.tags && item.tags.map((tag, idx) => (
                                                        <Tag key={idx} color={getTagColor(tag)}
                                                             bordered={false}>{tag}</Tag>
                                                    ))}
                                                </div>
                                                <p className="card-date">
                                                    <CalendarOutlined/> {item.date}
                                                </p>
                                                <div className="card-desc">
                                                    <ReactMarkdown>{truncate(item.description, 80)}</ReactMarkdown>
                                                </div>
                                                {item.images && item.images.length > 0 && (
                                                    <div className="card-images">
                                                        <div className="card-img-box">
                                                            <img src={item.images[0]}
                                                                 alt={`${item.title} 图片`}/>
                                                            <div className="card-img-shine"/>
                                                            {item.images.length > 1 && (
                                                                <div className="img-overlay">
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

                <Modal
                    title={detailItem ? <span style={{fontSize: 18}}>{detailItem.emoji} {detailItem.title}</span> : ''}
                    open={detailVisible}
                    onCancel={() => setDetailVisible(false)}
                    footer={null}
                    width={720}
                    centered
                    className="detail-modal"
                >
                    {detailItem && (
                        <div className="detail-body">
                            <div className="detail-meta">
                                {detailItem.tags && detailItem.tags.map((tag, idx) => (
                                    <Tag key={idx} color={getTagColor(tag)} bordered={false}>{tag}</Tag>
                                ))}
                                <span className="detail-date"><CalendarOutlined/> {detailItem.date}</span>
                            </div>
                            <div className="detail-desc">
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