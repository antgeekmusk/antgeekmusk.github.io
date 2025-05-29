import React from 'react';
import '../styles/Sidebar.css';
import Announcement from './sidebar/Announcement';
import LatestArticles from './sidebar/LatestArticles';
import Categories from './sidebar/Categories';
import Tags from './sidebar/Tags';
import Archives from './sidebar/Archives';
import SiteInfo from './sidebar/SiteInfo';
import StickyWrapper from "./sidebar/StickyWrapper";
import GitHubCalendar from "react-github-calendar";
import MyGithubCalendar from "./GithubCalendar/MyGithubCalendar";
interface OutlineItem {
    level: number;
    text: string;
}

interface SidebarProps {
    outline?: OutlineItem[];
    showGithubCalender?: boolean;
}
const Sidebar: React.FC<SidebarProps> = ({ outline ,showGithubCalender=false}) => {
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
            {/*github 日历*/}
            {showGithubCalender &&
                <MyGithubCalendar />
            }

            {/*最新文章*/}



            {/*<LatestArticles />*/}
            {/*<Tags />*/}
            {/*<Archives />*/}
            {/*<SiteInfo />*/}
        </div>
    );
};

export default Sidebar;