import React from 'react';
import IconFont from "../Icon/IconFont";
import '../../styles/Categories.css';
interface OutlineItem {
    level: number;
    text: string;
}

interface CategoriesProps {
    outline: OutlineItem[];
    showTitleBar? : boolean;

}
const Categories: React.FC<CategoriesProps> = ({
    outline,
    showTitleBar = true
}) => {
    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, text: string) => {
        e.preventDefault(); // 阻止默认跳转行为
        const targetElement = document.getElementById(text);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    return (
        <div className="sidebar-section">
            <div className="title-bar">
                {showTitleBar && <IconFont type="icon-dagang" className="title-icon"/>}
                <span className="title-text">大纲</span>
            </div>
            <ul className="categories-list">
                {outline.map((item, index) => (
                    <li key={index} className="categories-item" style={{marginLeft: `${(item.level - 1) * 20}px`}}>
                        <a
                            href={`#${item.text || ''}`}
                            className="categories-link"
                            onClick={(e) => handleAnchorClick(e, item.text || '')}
                        >
                            {item.text || '无标题'}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Categories;