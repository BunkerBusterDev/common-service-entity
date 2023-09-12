import dotenv from 'dotenv';
import koa from 'koa';
import morgan from 'koa-morgan';
import { getLogger, httpLogStream } from 'lib/winston';

const processEnv: { [key: string]: string } = {};
dotenv.config({ processEnv });

const { PORT: port } = processEnv;

const app = new koa();

const logger = getLogger('app');

logger.error('error');
logger.warn('warn');
logger.info('info');
logger.debug('debug');
logger.silly('silly');

const loggerStream = getLogger('httpLogStream');
// app.use(morgan('dev', { stream: httpLogStream }));
app.use(morgan('combined', { stream: httpLogStream(loggerStream) }));

app.listen(port, () => {
    logger.info('Ready to start Server, listening port 38800');
});
