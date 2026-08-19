import React, { useEffect, useState, useRef } from 'react';
import { Timeline, Card, Row, Col, Layout, Tag, Select, Modal } from 'antd';
import { CalendarOutlined, PlusOutlined, CodeOutlined } from '@ant-design/icons';
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
    emoji?: string;
    route: string;
};

type Portfolio = {
    year: string;
    items: PortfolioItem[];
};

const truncate = (text: string, maxLen: number): string =>
    text.length > maxLen ? text.substring(0, maxLen) + '\u2026' : text;

const addBaseTag = () => {
    const base = document.createElement('base');
    base.target = '_blank';
    document.head.appendChild(base);
};

const PortfolioPage: React.FC = () => {
    const navigate = useNavigate();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [myInfo, setMyInfo] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [detailItem, setDetailItem] = useState<PortfolioItem | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        addBaseTag();
        fetch('/data/portfolio/portfolio.json')
            .then(response => response.json())
            .then(data => {
                setPortfolios(data);
                const tags = new Set<string>();
                data.forEach((portfolio: Portfolio) => {
                    portfolio.items.forEach(item => {
                        item.tags?.forEach(tag => tags.add(tag));
                    });
                });
                setAllTags(Array.from(tags));
            });
        fetch('/data/portfolio/myInfo.md')
            .then(response => response.text())
            .then(text => setMyInfo(text));
    }, []);

    const filteredPortfolios = selectedTag
        ? portfolios.map(portfolio => ({
            ...portfolio,
            items: portfolio.items.filter(item => item.tags?.includes(selectedTag))
        })).filter(portfolio => portfolio.items.length > 0)
        : portfolios;

    // 滚动出场动画
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();
        const timer = setTimeout(() => {
            const cards = document.querySelectorAll('.portfolio-card');
            if (!cards.length) return;
            observerRef.current = new IntersectionObserver((entries) => {
                entries.forEach((_entry) => {
                    const el = _entry.target as HTMLElement;
                    if (_entry.isIntersecting) {
                        const col = el.parentElement;
                        const row = col?.parentElement;
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
    }, [filteredPortfolios]);

    const handleTagChange = (value: string) => setSelectedTag(value);

    const openDetail = (item: PortfolioItem) => {
        setDetailItem(item);
        setDetailVisible(true);
    };

    const handleCardClick = (item: PortfolioItem) => {
        if (item.route) window.open('/Portfolio' + item.route, '_blank');
    };

    return (
        <Layout>
            <BlogHeader colorChangeFlag={false}/>
            <Content className="portfolio-page">
                <div className="bg-blob bg-blob-1"/>
                <div className="bg-blob bg-blob-2"/>

                <div className="self-introduction">
                    <h1>我的介绍</h1>
                    <ReactMarkdown>{myInfo}</ReactMarkdown>
                </div>

                <div className="portfolio-wall">
                    <div className="wall-header">
                        <h1 className="wall-title">
                            <CodeOutlined className="title-icon"/> 作品集
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
                        {filteredPortfolios.map((portfolio) => (
                            <Timeline.Item key={portfolio.year}
                                           dot={<span className="timeline-dot"><span className="dot-inner"/></span>}>
                                <h3 className="portfolio-year">{portfolio.year}</h3>
                                <Row gutter={[16, 16]}>
                                    {portfolio.items.map((item, index) => (
                                        <Col key={index} span={8}>
                                            <Card className="portfolio-card" hoverable
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
                                {detailItem.route && (
                                    <a className="detail-route-btn"
                                       href={'/Portfolio' + detailItem.route}
                                       target="_blank" rel="noopener">
                                        打开作品 →
                                    </a>
                                )}
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

export default PortfolioPage;