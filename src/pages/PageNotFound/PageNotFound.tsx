import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
const PageNotFound: React.FC = () => {
    const navigate = useNavigate();
  return (
      <Result
          status="404"
          title="404"
          subTitle="访问的页面不存在,请返回首页"
          extra={<Button type="primary" onClick={() => navigate('/')}>回首页</Button>}
      />
  );
}

export default PageNotFound;