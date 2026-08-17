import React, {useEffect, useState} from 'react';
import {Tag} from 'antd';
import {getTagColor} from '../../../utils/common';

interface TagItem {
    name: string;
    count: number;
}

/**
 * 侧边栏 - 热门标签（按文章中的使用次数统计，展示前 20 个）
 * 注：当前侧边栏暂未挂载该组件，保留为可复用模块。
 */
const Tags: React.FC = () => {
    const [tags, setTags] = useState<TagItem[]>([]);

    useEffect(() => {
        fetch('/data/blog/blogs_config.json')
            .then(resp => resp.json())
            .then((blogs: any[]) => {
                const counts = new Map<string, number>();
                blogs.forEach((blog) => {
                    (blog.tags || []).forEach((tag: string) => {
                        counts.set(tag, (counts.get(tag) || 0) + 1);
                    });
                });
                setTags(
                    Array.from(counts.entries())
                        .map(([name, count]) => ({name, count}))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 20)
                );
            })
            .catch(() => {
            });
    }, []);

    return (
        <div className="sidebar-section">
            <h3>Tags</h3>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
                {tags.map((tag) => (
                    <Tag key={tag.name} color={getTagColor(tag.name)}>
                        {tag.name} ({tag.count})
                    </Tag>
                ))}
                {tags.length === 0 && <span style={{color: '#999'}}>暂无标签</span>}
            </div>
        </div>
    );
};

export default Tags;
