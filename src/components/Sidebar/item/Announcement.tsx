import React from 'react';
import '../../../styles/Announcement.css';
import IconFont from "../../Icon/IconFont";

const Announcement: React.FC = () => {
    return (
        <div className="sidebar-section">
            <div className="title-bar">
                <IconFont type="icon-xinwengonggao" className="title-icon" />
                <span className="title-text">公告</span>
            </div>
            <p>网站建设中.....</p>
        </div>
    );
};

export default Announcement;