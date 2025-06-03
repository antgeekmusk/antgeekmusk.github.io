import React, {useEffect, useState} from 'react';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import IconFont from "../../Icon/IconFont";
import {useNavigate} from "react-router-dom";


type MenuItem = Required<MenuProps>['items'][number];


const SidebarColumn: React.FC = () => {
        const [items, setItems] = useState<MenuItem[]>([]);
        const navigate = useNavigate();
        // 获取专栏数据
        useEffect(() => {
            fetch('/data/blog/blogs_config.json')
                .then(resp => resp.json())
                .then(data => {
                    let columnsMap = new Map<string, { articleCount: number, order: number }>();
                    // 查找匹配的博客
                    data.forEach((blog: any) => {
                        if (blog['columns']) {
                            blog['columns'].forEach((column: string) => {
                                if(columnsMap.has(column)){
                                    columnsMap.set(column,{articleCount: columnsMap.get(column)!.articleCount + 1, order: 1});
                                }else {
                                    columnsMap.set(column, { articleCount: 1, order: 1 });
                                }
                            })
                        }
                    })
                    // 更新column的配置
                    fetch('/data/blog/columns_config.json')
                        .then(resp => resp.json())
                        .then(columnsConfig => {
                            columnsConfig.forEach((column: any) => {
                                if (columnsMap.has(column.name)) {
                                    const existingColumn = columnsMap.get(column.name)!;
                                    columnsMap.set(column.name, {
                                        articleCount: existingColumn.articleCount,
                                        order: column.order || existingColumn.order
                                    });
                                } else {
                                    columnsMap.set(column.name, { articleCount: 0, order: column.order || 1 });
                                }
                            });

                            const sortedColumns = Array.from(columnsMap.entries())
                                .map(([name, { articleCount, order }]) => ({ name, articleCount, order }))
                                .sort((a, b) => {
                                    if (b.order !== a.order) {
                                        return b.order - a.order; // Sort by order descending
                                    }
                                    return b.articleCount - a.articleCount; // If order is the same, sort by articleCount descending
                                });
                            // Generate MenuItem array
                            const menuItems = sortedColumns.map((column) => ({
                                key: column.name,
                                label: `${column.name}(${column.articleCount})`,
                            }));

                            setItems(menuItems);
                        })


                })
        }, []);
    const onClick: MenuProps['onClick'] = (e) => {
        navigate("/column/"+e.key);
    };

    return (
        <div className="sidebar-section">
            <div className="title-bar">
                <IconFont type="icon-xinwengonggao" className="title-icon"/>
                <span className="title-text">专栏</span>
            </div>
            <Menu
                onClick={onClick}
                mode="inline"
                items={items}
            />
        </div>
    );
};

export default SidebarColumn;