import React, { useState } from 'react';
import { LoadingOutlined, PictureOutlined } from '@ant-design/icons';
import './SmartImage.css';

interface SmartImageProps {
    src: string;
    alt?: string;
    className?: string;
}

/**
 * 智能图片：加载中显示骨架屏闪烁动画（shimmer），加载完成淡入；
 * 加载失败显示占位图标。适用于足迹/作品集卡片首图与详情弹窗图片。
 */
const SmartImage: React.FC<SmartImageProps> = ({ src, alt = '', className = '' }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`smart-img${className ? ` ${className}` : ''}`}>
            {!loaded && !error && (
                <div className="smart-img-shimmer">
                    <LoadingOutlined className="smart-img-spinner" />
                </div>
            )}
            {error && (
                <div className="smart-img-error">
                    <PictureOutlined />
                    <span>图片加载失败</span>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className={`smart-img-el${loaded ? ' is-loaded' : ''}`}
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
            />
        </div>
    );
};

export default SmartImage;