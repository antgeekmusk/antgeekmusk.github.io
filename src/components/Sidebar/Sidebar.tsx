import React, {useEffect, useRef, useState} from 'react';
import '../../styles/Sidebar.css';
import Announcement from './item/Announcement';
import LatestArticles from './item/LatestArticles';
import Categories from './item/Categories';
import Tags from './item/Tags';
import Archives from './item/Archives';
import SiteInfo from './item/SiteInfo';
import StickyWrapper from "./item/StickyWrapper";
import GitHubCalendar from "react-github-calendar";
import MyGithubCalendar from "../GithubCalendar/MyGithubCalendar";
import SidebarColumn from "./item/SidebarColumn";
interface OutlineItem {
    level: number;
    text: string;
}

interface SidebarProps {
    outline?: OutlineItem[];
    showGithubCalender?: boolean;
    components: {
        component: React.ReactNode;
        sticky?: boolean;
        order?: number;
    }[];
}
const Sidebar: React.FC<SidebarProps> = ({ outline  ,showGithubCalender=false,components}) => {
    const [headerHeight, setHeaderHeight] = useState(60);
    const stickyRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        // 动态获取 Header 高度
        const header = document.querySelector('header');
        if (header) {
            setHeaderHeight(header.clientHeight+10);
        }
    }, []);

    const nonStickyComponents = components
        .filter((item) => !item.sticky)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

    const stickyComponents = components
        .filter((item) => item.sticky)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    return (
        <div className="sidebar">
            {/* Non-sticky components container */}
            <div>
                {nonStickyComponents.map((item, index) => (
                    <div key={index}>{item.component}</div>
                ))}
            </div>

            {/* Sticky components container */}
            <div
                ref={stickyRef}
                style={{
                    position: 'sticky',
                    top: `${headerHeight}px`, // 动态设置 top 值
                }}
            >
                {stickyComponents.map((item, index) => (
                    <div key={index}>
                        {item.component}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;