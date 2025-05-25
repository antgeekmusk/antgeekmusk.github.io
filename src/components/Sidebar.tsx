import React from 'react';
import '../styles/Sidebar.css';
import Announcement from './sidebar/Announcement';
import LatestArticles from './sidebar/LatestArticles';
import Categories from './sidebar/Categories';
import Tags from './sidebar/Tags';
import Archives from './sidebar/Archives';
import SiteInfo from './sidebar/SiteInfo';
import StickyWrapper from "./sidebar/StickyWrapper";
interface OutlineItem {
    level: number;
    text: string;
}

interface SidebarProps {
    outline?: OutlineItem[];
}
const Sidebar: React.FC<SidebarProps> = ({ outline }) => {
    return (
        <div className="sidebar">
            {/*公告*/}
                <Announcement />
            {/*文章大纲*/}
            {outline &&
                <StickyWrapper>
                    <Categories outline={outline}/>
                </StickyWrapper>
            }



            {/*<LatestArticles />*/}
            {/*<Tags />*/}
            {/*<Archives />*/}
            {/*<SiteInfo />*/}
        </div>
    );
};

export default Sidebar;