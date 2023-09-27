import Koa from 'koa';

import util from 'lib/util';
import lookupModel from 'database/models/lookup';
import CSEBaseModel from 'database/models/CSEBase';

const getCSE = async (ctx: Koa.DefaultContext, next: Koa.Next) => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('cseControl', 'getCSE');
    try {
        const resultLookup = await lookupModel.findByResourceIDinLookupOrShortResourceID(
            ctx.request.ri,
            ctx.request.sri,
        );

        if (resultLookup.length === 0) {
            const error = `no Resource ${ctx.request.ri}`;
            logger.error(logCategory + error);
            ctx.status = 500;
            ctx.body = error;
        } else {
            try {
                const resultCSEBase = await CSEBaseModel.findOne({ ri: resultLookup[0].ri }, { _id: 0, __v: 0 });

                if (resultCSEBase === null) {
                    const error = `no commonServiceEntityBase ${ctx.request.ri}`;
                    logger.error(logCategory + error);

                    ctx.status = 404;
                    ctx.body = error;
                } else {
                    // const resourceObject = Object.assign(resultLookup[0], resultCSEBase.toObject());
                    const resourceObject = { ...resultLookup[0], ...resultCSEBase.toObject() };

                    const targetObject: { [key: string]: string } = {};
                    const ty = resourceObject.ty;
                    targetObject[util.getrnByty(ty)] = resourceObject;
                    const rootName = Object.keys(targetObject)[0];
                    util.makeObject(targetObject[rootName]);
                    // ctx.body = resourceObject;

                    ctx.request.targetObject = JSON.parse(JSON.stringify(targetObject));

                    return next();
                }
            } catch (error) {
                logger.error(logCategory + error);
                ctx.status = 500;
                ctx.body = 'error';
            }
        }
    } catch (error) {
        logger.error(logCategory + error);
        ctx.status = 500;
        ctx.body = error;
    }
};

const getTest = (ctx: Koa.DefaultContext, next: Koa.Next) => {
    console.log(ctx.request);
    return next();
};

export = { getCSE, getTest };
