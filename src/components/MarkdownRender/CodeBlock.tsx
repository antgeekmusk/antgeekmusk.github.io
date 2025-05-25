import React from 'react';
import { message } from 'antd';
interface CodeBlockProps {
    className?: string;
    children?: React.ReactNode;
    [key: string]: any; // 允许其他额外的属性
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children, ...props }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const handleCopy = (code: React.ReactNode) => {
        let codeContent = ''
        for (let ele of React.Children.toArray(code)) {
            if(typeof ele === 'string') {
                codeContent = codeContent.concat(ele)
            }else if(React.isValidElement(ele)){
                codeContent = codeContent.concat(ele.props.children)
            }
        }

        navigator.clipboard.writeText(codeContent).then(() => {
            messageApi.open({
                type: 'success',
                content: '复制成功',
                duration: 1,
            })
        }).catch(err => {
            console.error('Failed to copy code: ', err);
        });
    };

    return (
        <div
            style={{
                position: 'relative',
                marginBottom: '1rem',

            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {contextHolder}
            <pre>
                <code
                    className={className}
                    {...props}
                    style={{
                        borderRadius: '10px',
                    }}
                >{children}</code>
            </pre>
            <button
                onClick={() => handleCopy(children)}
                style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'grey',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '3px 3px',
                    cursor: 'pointer',
                    display: isHovered ? 'block' : 'none',
                }}
            >
                复制
            </button>
        </div>
    );
};

export default CodeBlock;