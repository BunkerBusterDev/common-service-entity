import os from 'os';
import cluster from 'cluster';
import moment from 'moment-timezone';

import database from 'database';
import CSEBase from 'core/CSEBase';
import httpServer from 'core/http';
import proxyMqtt from 'core/mqtt';
import lookupModel from 'database/models/lookup';
import * as WatchdogTimer from './lib/watchdogTimer';

const cpuCount = os.cpus().length;
const worker = [];
const useClustering = false;
moment().tz('Asia/Seoul');

const deleteRequestResource = async () => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('App', 'deleteRequestResource');
    try {
        const result = await lookupModel.deleteRequest();
        logger.info(`${logCategory}${result.deletedCount} requested resource(s) deleted`);
    } catch (error) {
        logger.error(error);
    }
};

const deleteExpiredResource = async () => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('App', 'deleteExpiredResource');
    try {
        const et = moment().add(11, 'years').format('YYYY-MM-DDTHH:mm:ss');
        const result = await lookupModel.deleteExpiredLookup(et);
        logger.info(`${logCategory}${result.deletedCount} expired resource(s) deleted`);
    } catch (error) {
        logger.error(logCategory + error);
    }
};

const initialize = async () => {
    if (useClustering) {
        if (cluster.isPrimary) {
            const logger = global.getLogger();
            const logCategory = global.getLogCategory('App', 'clusteringPrimary');
            cluster.on('death', (worker) => {
                logger.error(`${logCategory}worker${worker.pid} died --> start again`);
            });

            const result = await database.connect();
            if (result) {
                logger.info(`CPU Count = ${cpuCount}`);
                for (let i = 0; i < cpuCount; i++) {
                    worker[i] = cluster.fork();
                }
                await CSEBase.create();

                WatchdogTimer.setWatchdogTimer('deleteRequestResource', 24 * 60 * 60, deleteRequestResource);
                WatchdogTimer.setWatchdogTimer('deleteExpiredResource', 24 * 60 * 60, deleteExpiredResource);
            }
        } else {
            const result = await database.connect(cluster.worker?.id);
            if (result) {
                const code = await httpServer.startServer(cluster.worker?.id);
                if (code === '200') {
                    await CSEBase.create();
                }
            }
        }
    } else {
        const resultConnectDB = await database.connect();
        if (resultConnectDB) {
            const response = await httpServer.startServer();
            if (response === '200') {
                await CSEBase.create();

                WatchdogTimer.setWatchdogTimer('deleteRequestResource', 24 * 60 * 60, deleteRequestResource);
                WatchdogTimer.setWatchdogTimer('deleteExpiredResource', 24 * 60 * 60, deleteExpiredResource);
                proxyMqtt.initialize();
            }
        }
    }
};

initialize();
