/**
 * 站点设置：数据目录信息、个人介绍读取。
 */
const express = require('express');
const { DATA_DIR, DATA_PATHS } = require('../config');
const { readText } = require('../utils');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        dataDir: DATA_DIR,
        files: {
            blogsConfig: DATA_PATHS.blogsConfig,
            columnsConfig: DATA_PATHS.columnsConfig,
            tagColorConfig: DATA_PATHS.tagColorConfig,
            achievementJson: DATA_PATHS.achievementJson,
            portfolioJson: DATA_PATHS.portfolioJson,
            achievementMyInfo: DATA_PATHS.achievementMyInfo,
            portfolioMyInfo: DATA_PATHS.portfolioMyInfo,
        },
        achievementMyInfo: readText(DATA_PATHS.achievementMyInfo),
        portfolioMyInfo: readText(DATA_PATHS.portfolioMyInfo),
    });
});

module.exports = router;
