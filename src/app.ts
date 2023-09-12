import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';

import koa from 'koa';
import morgan from 'koa-morgan';

import { httpLogStream } from 'lib/winston';

const processEnv: { [key: string]: string } = {};
dotenv.config({ processEnv });

const { PORT: port } = processEnv;

const app = new koa();
const loggerStream = global.getLogger('httpLogStream');
app.use(morgan('combined', { stream: httpLogStream(loggerStream) }));

declare global {
    function test(): void;
}

const logger = global.getLogger('app');

const cpuCount = os.cpus().length;
const worker = [];
const useClustering = true;

if (useClustering) {
    if (cluster.isPrimary) {
        cluster.on('death', (worker) => {
            console.log(`worker${worker.pid} died --> start again`);
        });

        logger.info(`CPU Count = ${cpuCount}`);
        for (let i = 0; i < cpuCount; i++) {
            worker[i] = cluster.fork();
        }
    } else {
        app.listen(port, () => {
            logger.info(`Worker${cluster.worker?.id} Ready to start Server, listening port ${port}`);
        });
    }
} else {
    logger.info(`Primary is working`);
}
