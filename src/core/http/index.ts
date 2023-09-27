import koa from 'koa';
import http from 'http';
import koaRouter from '@koa/router';

import config from 'config';

import api from 'api';
import getHitAll from 'api/getHitAll';
import middlewares from './middlewares';

const httpApp = new koa();
const port = config.cseInfo.useCSEBasePort === undefined ? '7579' : config.cseInfo.useCSEBasePort;
const router = new koaRouter();

httpApp.use(middlewares.morgan);
httpApp.use(middlewares.bodyParser);
httpApp.use(middlewares.crossOriginResourceSharing);
httpApp.use(middlewares.checkBind);
httpApp.use(middlewares.checkXm2mHeaders);
httpApp.use(middlewares.getTarget);

router.get('/hit', getHitAll);
router.use(`/:cseName`, api.routes());
httpApp.use(router.routes());

const startServer = (clusterId?: number) => {
    return new Promise((resolve) => {
        const logger = global.getLogger();
        const logCategory = global.getLogCategory('httpServer', 'listen');

        try {
            http.globalAgent.maxSockets = 1000000;
            http.createServer(httpApp.callback()).listen({ port: port, agent: false }, () => {
                if (clusterId) {
                    logger.info(`${logCategory}CSE server running at ${port} by Worker[${clusterId}]`);
                } else {
                    logger.info(`${logCategory}CSE server running at ${port} by Primary`);
                }
                resolve('200');
            });
        } catch (error) {
            logger.error(logCategory + error);
        }
    });
};

export = { startServer };
