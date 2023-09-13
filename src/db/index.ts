import mongoose, { Connection } from 'mongoose';

export default class Server {
    dbId!: string;
    dbPw!: string;

    constructor() {
        const logger = global.getLogger('DB', 'constructor');
        const { DB_ID: db_id, DB_PW: db_pw } = process.env;

        if (db_id === undefined || db_pw === undefined) {
            logger.error('Database ID or PW is undefined');
        } else {
            this.dbId = db_id;
            this.dbPw = db_pw;
        }
    }

    connect(clusterId?: number) {
        return new Promise<{ code: string; connection: Connection }>((resolve, reject) => {
            const logger = global.getLogger('DB', 'connect');
            mongoose
                .createConnection('mongodb://127.0.0.1:27017', {
                    user: this.dbId,
                    pass: this.dbPw,
                    retryWrites: true,
                    authSource: 'admin',
                    dbName: 'experiment',
                })
                .asPromise()
                .then((connection) => {
                    if (clusterId) {
                        logger.info(`MongoDB connected by Worker[${clusterId}]`);
                    } else {
                        logger.info(`MongoDB connected by Primary`);
                    }
                    resolve({ code: '200', connection: connection });
                })
                .catch((error) => {
                    logger.error(error);
                    reject({ code: '500', connection: undefined });
                });
        });
    }
}
