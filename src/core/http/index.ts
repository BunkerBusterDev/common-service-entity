import koa from 'koa';
import http from 'http';
import koaRouter from '@koa/router';

import config from 'config';

import api from 'api';
import getHitAll from 'api/getHitAll';
import middlewares from './middlewares';

export default class httpServer {
    private httpApp: koa;
    private port: string;
    private router;

    constructor() {
        this.port = config.cseInfo.useCSEBasePort === undefined ? '7579' : config.cseInfo.useCSEBasePort;

        this.httpApp = new koa();

        this.httpApp.use(middlewares.morgan);
        this.httpApp.use(middlewares.bodyParser);
        this.httpApp.use(middlewares.crossOriginResourceSharing);
        this.httpApp.use(middlewares.checkBind);
        this.httpApp.use(middlewares.checkXm2mHeaders);
        this.httpApp.use(middlewares.getTarget);

        this.router = new koaRouter();

        this.router.get('/hit', getHitAll);
        this.router.use(`/:cseName`, api.routes());
        this.httpApp.use(this.router.routes());
    }

    public listen(clusterId?: number) {
        return new Promise((resolve) => {
            const { httpApp, port } = this;
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
    }
}
