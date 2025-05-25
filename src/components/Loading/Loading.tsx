import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import '../../styles/Loading.css'; // Optional: Add custom styles if needed

const Loading: React.FC = () => {
    const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />;
    return (
        <div className="loading-container">
            <Spin indicator={antIcon} />
            <p>加载中...</p>
        </div>
    );
};

export default Loading;