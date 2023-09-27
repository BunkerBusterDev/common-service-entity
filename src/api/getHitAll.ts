import koa from 'koa';
import moment from 'moment-timezone';
import hitModel from 'database/models/hit';

const getHitAll = async (ctx: koa.Context) => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('getHitAll');
    try {
        const until = moment().subtract(1, 'year').format('YYYY-MM-DD');

        const result = await hitModel.getHitAll(until);

        ctx.response.type = 'application/json';
        ctx.body = JSON.stringify(result);
    } catch (error) {
        logger.error(logCategory + error);
        ctx.status = 500;
        ctx.body = error;
    }
};

export = getHitAll;
