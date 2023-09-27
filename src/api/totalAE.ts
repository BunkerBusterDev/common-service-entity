import koa from 'koa';

import applicationEntityModel from 'database/models/applicationEntity';

const totalApplicationEntity = async (ctx: koa.Context) => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('totalApplicationEntity');
    try {
        await applicationEntityModel.find();
    } catch (error) {
        logger.error(logCategory + error);
        ctx.status = 500;
        ctx.body = { error: error };
    }
};

export = totalApplicationEntity;
