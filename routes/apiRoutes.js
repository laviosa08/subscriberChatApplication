const express = require('express');
const router = express.Router();
const userModule = require('../modules/user')
const subscriptionModule = require('../modules/subscription');
const chatModule = require('../modules/chat')

router.use('/user', userModule);
router.use('/chat', chatModule);
router.use('/subscription', subscriptionModule);


router.all('/*', (req, res) => {
    return res.status(constants.code.error.notFound).json({
        error: l10n.t('ERR_URL_NOT_FOUND'),
    });
});


module.exports = router;
