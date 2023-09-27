// import fs from 'fs';
import http from 'http';
import https from 'https';
import { nanoid } from 'nanoid';

import config from 'config';

const httpRetrieveCB = () => {
    return new Promise<{ [key: string]: string | string[] | undefined }>((resolve) => {
        const logger = global.getLogger();
        const logCategory = global.getLogCategory('httpRetrieveCB');
        const ri = '/' + config.cseInfo.useCSEBase;
        let responseBody = '';
        let request;

        const options = {
            hostname: config.mqttInfo.useMqttCSEBaseHost,
            port: config.cseInfo.useCSEBasePort,
            path: ri,
            method: 'get',
            headers: {
                'X-M2M-RI': nanoid(),
                Accept: 'application/json',
                'X-M2M-Origin': config.cseInfo.useCSEID,
                'X-M2M-RVI': config.setup.useReleaseVersionIndicator,
            },
            rejectUnauthorized: false,
        };

        if (config.setup.useSecure === 'disable') {
            request = http.request(options, (response) => {
                response.setEncoding('utf8');
                response.on('data', (chunk) => {
                    responseBody += chunk;
                });

                response.on('end', () => {
                    resolve({ resCode: response.headers['x-m2m-rsc'], resBody: responseBody });
                });
            });
        } else {
            // options.certificatedAuthority = fs.readFileSync('ca-crt.pem');

            request = https.request(options, (response) => {
                response.setEncoding('utf8');
                response.on('data', (chunk) => {
                    responseBody += chunk;
                });

                response.on('end', () => {
                    resolve({ resCode: response.headers['x-m2m-rsc'], resBody: responseBody });
                });
            });
        }

        request.on('error', (error) => {
            if (error.message !== 'read ECONNRESET') {
                logger.error(`${logCategory}Problem with request: ${error.message}`);
            }
        });

        // write data to request body
        request.write('');
        request.end();
    });
};

export = httpRetrieveCB;
