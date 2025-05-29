import React,{ useEffect, useRef,useState } from 'react';
import GitHubCalendar from 'react-github-calendar';
import IconFont from "../Icon/IconFont";
import Loading from "../Loading/Loading";

function MyGithubCalendar() {
    const calendarRef = useRef<HTMLDivElement>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    useEffect(() => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const observer = new MutationObserver(() => {
                // Check if the calendar content is loaded
                const scrollableDiv = calendarEl.querySelector('article > div');
                if (scrollableDiv) {
                    setIsDataLoaded(true);
                    observer.disconnect(); // Stop observing once data is loaded
                }
            });

            observer.observe(calendarEl, { childList: true, subtree: true });

            return () => observer.disconnect(); // Cleanup on unmount
        }
    }, []);

    useEffect(() => {
        const scrollToLatest = () => {
            const calendarEl = calendarRef.current;
            if (calendarEl) {
                const scrollableDiv = calendarEl.querySelector('article > div');
                if(scrollableDiv){
                    // 滚动到最右侧（最新日期）
                    scrollableDiv.scrollLeft = scrollableDiv.scrollWidth;
                }
            }
        };
        scrollToLatest();
    }, [isDataLoaded]); // 仅在挂载和卸载时执行
    return (
        <div ref={calendarRef} style={{overflowX:'auto'}} className="sidebar-section">
            <div className="title-bar">
                <IconFont type="icon-calendar" className="title-icon"/>
                <span className="title-text">码历</span>
            </div>
            <GitHubCalendar
                username="antgeekmusk"
                labels={{
                    months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
                }}
                hideTotalCount={true}
            />
        </div>
    );
}

export default MyGithubCalendar;