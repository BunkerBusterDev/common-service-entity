import koa from 'koa';
import koaBody from 'koa-body';
import morgan from 'koa-morgan';

import { httpLogStream } from 'lib/winston';

export default class Server {
    private app: koa;
    private port: string;

    constructor() {
        this.port = process.env.PORT === undefined ? '7579' : process.env.PORT;

        this.app = new koa();
        this.middleware();
    }

    private middleware(): void {
        const { app } = this;

        const loggerStream = global.getLogger('httpLogStream');
        app.use(morgan('combined', { stream: httpLogStream(loggerStream) }));
        app.use(
            koaBody({
                multipart: true,
            }),
        );
    }

    public listen(clusterId?: number) {
        return new Promise((resolve) => {
            const { app, port } = this;
            const logger = global.getLogger('Server', 'listen');

            try {
                app.listen(port);

                if (clusterId) {
                    logger.info(`CSE server running at ${port} by Worker[${clusterId}]`);
                } else {
                    logger.info(`CSE server running at ${port} by Primary`);
                }
                resolve('200');
            } catch (error) {
                logger.error(error);
            }
        });
    }
}
