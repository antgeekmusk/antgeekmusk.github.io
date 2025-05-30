import React from 'react';
import IconFont from "../../Icon/IconFont";
import '../../../styles/Categories.css';
interface OutlineItem {
    level: number;
    text: string;
}

interface CategoriesProps {
    outline: OutlineItem[];
    isDetailOutline? : boolean;

}
const Categories: React.FC<CategoriesProps> = ({
    outline,
    isDetailOutline = false
}) => {
    const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, text: string) => {
        e.preventDefault(); // 阻止默认跳转行为
        const targetElement = document.getElementById(text);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };
    return (
        <div
            className={`sidebar-section ${isDetailOutline ? 'no-hover' : ''}`}
            style={
                isDetailOutline
                    ? {boxShadow: 'none', borderRadius: '0', transition: 'none',border: 'none'}
                    : {}
            }
        >
            <div className="title-bar">
                {!isDetailOutline && <IconFont type="icon-dagang" className="title-icon"/>}
                <span
                    className="title-text"
                    style={isDetailOutline ? {fontWeight: 'bold', fontSize: '18px'} : {}}
                >
                    目录
                </span>
            </div>

            <ul className="categories-list"
                style={
                    isDetailOutline
                        ? { overflowY: 'scroll', maxHeight: '100%' }
                        : {}
                }
            >
                {outline.map((item, index) => (
                    <li key={index}
                        className={`${isDetailOutline ? 'categories-item-detail' : 'categories-item'}`}
                        style={{marginLeft: `${(item.level - 1) * 20}px`}}>
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