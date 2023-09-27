import mongoose from 'mongoose';

import config from 'config';

export default class Server {
    private dbId!: string;
    private dbPw!: string;

    constructor() {
        this.dbId = config.dbInfo.useDBID;
        this.dbPw = config.dbInfo.useDBPW;
        mongoose.Schema.Types.String.checkRequired((v) => v !== null);
    }

    public async connect(clusterId?: number) {
        const logger = global.getLogger();
        const logCategory = global.getLogCategory('DB', 'connect');
        try {
            await mongoose.connect('mongodb://127.0.0.1:27017', {
                user: this.dbId,
                pass: this.dbPw,
                retryWrites: true,
                authSource: 'admin',
                dbName: 'experiment',
            });
            if (clusterId) {
                logger.info(`${logCategory}MongoDB connected by Worker[${clusterId}]`);
            } else {
                logger.info(`${logCategory}MongoDB connected by Primary`);
            }

            return true;
        } catch (error) {
            logger.error(logCategory + error);
            return false;
        }
    }
}
