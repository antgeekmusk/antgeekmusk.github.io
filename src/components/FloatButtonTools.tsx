import React, { useState, useEffect } from 'react';
import { FloatButton } from 'antd';
import { VerticalLeftOutlined,VerticalRightOutlined } from '@ant-design/icons';
interface FloatButtonToolsProps {
    BackTopButton?: boolean // 是否显示回到顶部按钮
    SidebarVisibleButton?: boolean // 是否显示收起侧边栏按钮
    SidebarOnClick?: () => void // 收起侧边栏按钮点击事件
    SidebarVisible?: boolean // 侧边栏是否可见
}
const FloatButtonTools: React.FC<FloatButtonToolsProps> = (props) => {
    return (
        <FloatButton.Group shape="circle">
            {/*侧边栏*/}
            {
                props.SidebarVisibleButton &&
                <FloatButton
                    icon={props.SidebarVisible ? <VerticalLeftOutlined /> : <VerticalRightOutlined />}
                    tooltip={props.SidebarVisible ? '收起侧边栏' : '展开侧边栏'}
                    onClick={props.SidebarOnClick}
                />
            }
            {/*回到顶部*/}
            {
                props.BackTopButton &&
                <FloatButton.BackTop
                    visibilityHeight={100}
                    tooltip={'回到顶部'}
                />
            }
        </FloatButton.Group>
    );
};

export default FloatButtonTools;