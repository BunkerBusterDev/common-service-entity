import os from 'os';
import cluster from 'cluster';
import moment from 'moment-timezone';

import Database from 'database';
import CSEBase from 'core/cseBase';
import Server from 'core/server';
import lookupModel from 'database/models/lookup';
import * as WatchdogTimer from 'lib/watchdogTimer';

const cpuCount = os.cpus().length;
const worker = [];
const useClustering = false;
moment().tz('Asia/Seoul');

const server: Server = new Server();
const database: Database = new Database();
const cseBase: CSEBase = new CSEBase();

const deleteRequestResource = async () => {
    const logger = global.getLogger('App', 'deleteRequestResource');
    try {
        const result = await lookupModel.deleteRequest();
        logger.info(`${result.deletedCount} requested resource(s) deleted`);
    } catch (error) {
        logger.error(error);
    }
};

const deleteExpiredResource = async () => {
    const logger = global.getLogger('App', 'deleteExpiredResource');
    try {
        const expirationTime = moment().add(11, 'years').format('YYYY-MM-DDTHH:mm:ss');
        const result = await lookupModel.deleteExpiredLookup(expirationTime);
        logger.info(`${result.deletedCount} expired resource(s) deleted`);
    } catch (error) {
        logger.error(error);
    }
};

const initialize = async () => {
    if (useClustering) {
        if (cluster.isPrimary) {
            const logger = global.getLogger('App', 'clusteringPrimary');
            cluster.on('death', (worker) => {
                logger.error(`worker${worker.pid} died --> start again`);
            });

            const result = await database.connect();
            if (result) {
                logger.info(`CPU Count = ${cpuCount}`);
                for (let i = 0; i < cpuCount; i++) {
                    worker[i] = cluster.fork();
                }
                await cseBase.create();

                WatchdogTimer.setWatchdogTimer('deleteRequestResource', 24 * 60 * 60, deleteRequestResource);
                WatchdogTimer.setWatchdogTimer('deleteExpiredResource', 24 * 60 * 60, deleteExpiredResource);
            }
        } else {
            const result = await database.connect(cluster.worker?.id);
            if (result) {
                const code = await server.listen(cluster.worker?.id);
                if (code === '200') {
                    await cseBase.create();
                }
            }
        }
    } else {
        const resultConnectDB = await database.connect();
        if (resultConnectDB) {
            const response = await server.listen();
            if (response === '200') {
                await cseBase.create();

                WatchdogTimer.setWatchdogTimer('deleteRequestResource', 24 * 60 * 60, deleteRequestResource);
                WatchdogTimer.setWatchdogTimer('deleteExpiredResource', 24 * 60 * 60, deleteExpiredResource);
            }
        }
    }
};

initialize();
