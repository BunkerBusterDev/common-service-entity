import os from 'os';
import cluster from 'cluster';

import DB from 'db';
import CB from 'core/cb';
import Server from 'core/server';

const cpuCount = os.cpus().length;
const worker = [];
const useClustering = false;

const server: Server = new Server();
const db: DB = new DB();
const cb: CB = new CB();

if (useClustering) {
    if (cluster.isPrimary) {
        const logger = global.getLogger('App', 'ClusteringPrimary');
        cluster.on('death', (worker) => {
            logger.info(`worker${worker.pid} died --> start again`);
        });

        db.connect()
            .then(({ code, connection }) => {
                if (code === '200') {
                    logger.info(`CPU Count = ${cpuCount}`);
                    for (let i = 0; i < cpuCount; i++) {
                        worker[i] = cluster.fork();
                    }
                    cb.create(connection);
                }
            })
            .catch((error) => {
                logger.error(error);
            });
    } else {
        const logger = global.getLogger('App', 'ClusteringWorker');
        db.connect(cluster.worker?.id)
            .then(({ code, connection }) => {
                if (code === '200') {
                    server
                        .listen(cluster.worker?.id)
                        .then((code) => {
                            if (code === '200') {
                                cb.create(connection);
                            }
                        })
                        .catch((error) => {
                            logger.error(error);
                        });
                }
            })
            .catch((error) => {
                logger.error(error);
            });
    }
} else {
    const logger = global.getLogger('App', 'Primary');
    db.connect()
        .then(({ code, connection }) => {
            if (code === '200') {
                server
                    .listen()
                    .then((code) => {
                        if (code === '200') {
                            cb.create(connection);
                        }
                    })
                    .catch((error) => {
                        logger.error(error);
                    });
            }
        })
        .catch((error) => {
            logger.error(error);
        });
}
