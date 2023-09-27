import koa from 'koa';
import http from 'http';
import mqtt from 'mqtt';
import util from 'util';

import config from 'config';
import httpRetrieveCSEBase from '../http/httpRetrieveCB';

export default class mqttServer {
    // private cacheTTL: number;
    private mqttApp: koa;
    private port: string;
    public proxyMqttClient!: mqtt.MqttClient;
    // private httpResponseQueue: Record<string, koa.DefaultContext>;
    // private messageCache: Record<string, Record<string, string | number>>;
    // private messageCache: { [key: string]: { [key: string]: string | number } };
    // private responseMqttRequestIdentifieriArray: Array<string>;

    constructor() {
        // this.cacheTTL = 3; // count
        this.port = config.proxyInfo.useProxyMqttPort === undefined ? '1883' : config.proxyInfo.useProxyMqttPort;
        this.mqttApp = new koa();
        console.log('test');
        // this.httpResponseQueue = {};
        // this.messageCache = {};
        // this.responseMqttRequestIdentifieriArray = [];
    }

    public requestSubscription(proxyMqttClient: mqtt.MqttClient) {
        console.log(this);
        const logger = global.getLogger();
        const logCategory = global.getLogCategory('mqttServer', 'requestSubscription');
        const requestTopic = util.format('/oneM2M/req/+/%s/+', config.cseInfo.useCSEID.replace('/', ''));
        proxyMqttClient.subscribe(requestTopic);
        logger.info(`${logCategory}subscribe requestTopic as ${requestTopic}`);

        // requestTopic = util.format('/oneM2M/req/+/%s/+', config.cseInfo.useCSEBase);
        // proxyMqttClient.subscribe(requestTopic);
        // console.log('subscribe requestTopic as ' + requestTopic);
    }

    // private registerRequestSubscription() {
    //     const logger = global.getLogger();
    //     const logCategory = global.getLogCategory('mqttServer', 'requestSubscription');
    //     const registerRequestTopic = util.format('/oneM2M/reg_req/+/%s/+', config.cseInfo.useCSEID.replace('/', ''));
    //     this.proxyMqttClient.subscribe(registerRequestTopic);
    //     logger.info(`${logCategory}subscribe registerRequestTopic as ${registerRequestTopic}`);

    //     // registerRequestTopic = util.format('/oneM2M/reg_req/+/%s/+', config.cseInfo.useCSEBase);
    //     // proxyMqttClient.subscribe(registerRequestTopic);
    //     // console.log('subscribe registerRequestTopic as ' + registerRequestTopic);
    // }

    // private mqttResponse(responseTopic: string, rsc: number, op: string, to: string, rqi: string, inpc: string) {
    //     const { messageCache, proxyMqttClient } = this;
    //     const responseMessage: { [key: string]: { [key: string]: string | number } } = {};
    //     responseMessage['m2m:rsp'] = {};
    //     responseMessage['m2m:rsp'].rsc = rsc;

    //     responseMessage['m2m:rsp'].rqi = rqi;
    //     responseMessage['m2m:rsp'].pc = inpc;

    //     const cacheKey = op.toString() + to.toString() + rqi.toString();

    //     try {
    //         if (cacheKey in messageCache) {
    //             messageCache[cacheKey].rsp = JSON.stringify(responseMessage['m2m:rsp']);
    //         } else {
    //             messageCache[cacheKey] = {};
    //             messageCache[cacheKey].rsp = JSON.stringify(responseMessage['m2m:rsp']);
    //         }

    //         proxyMqttClient.publish(responseTopic, messageCache[cacheKey].rsp as string);
    //     } catch (error) {
    //         console.log(error);
    //         delete messageCache[cacheKey];
    //         const dbg: { [key: string]: string } = {};
    //         dbg['m2m:dbg'] = '[mqtt_response]' + error;
    //         proxyMqttClient.publish(responseTopic, JSON.stringify(dbg));
    //     }
    // }

    // private mqttBinding(op: string, to: string, fr: string, rqi: string, ty: string, pc: string) {
    //     return new Promise<{ res: http.IncomingMessage; resBody: string }>((resolve) => {
    //         let contentType = 'application/vnd.onem2m-res+json';

    //         switch (op.toString()) {
    //             case '1':
    //                 op = 'post';
    //                 contentType += '; ty=' + ty;
    //                 break;
    //             case '2':
    //                 op = 'get';
    //                 break;
    //             case '3':
    //                 op = 'put';
    //                 break;
    //             case '4':
    //                 op = 'delete';
    //                 break;
    //         }

    //         let reqBodyString = '';
    //         if (op === 'post' || op === 'put') {
    //             reqBodyString = JSON.stringify(pc);
    //         }

    //         let bodyStr = '';

    //         const options = {
    //             hostname: config.mqttInfo.useMqttCSEBaseHost,
    //             port: config.cseInfo.useCSEBasePort,
    //             path: to,
    //             method: op,
    //             headers: {
    //                 'X-M2M-RI': rqi,
    //                 Accept: 'application/json',
    //                 'X-M2M-Origin': fr,
    //                 'Content-Type': contentType,
    //                 binding: 'M',
    //                 'X-M2M-RVI': config.setup.useReleaseVersionIndicator,
    //             },
    //         };

    //         const req = http.request(options, function (res) {
    //             res.setEncoding('utf8');

    //             res.on('data', function (chunk) {
    //                 bodyStr += chunk;
    //             });

    //             res.on('end', function () {
    //                 resolve({ res: res, resBody: bodyStr });
    //             });
    //         });

    //         req.on('error', function (error) {
    //             console.log('[pxymqtt-mqtt_binding] problem with request: ' + error.message);
    //         });

    //         req.write(reqBodyString);
    //         req.end();
    //     });
    // }

    // private async mqttMessageAction(
    //     topicArray: Array<string>,
    //     jsonObject: Record<string, Record<string, string | Record<string, string>>>,
    // ) {
    //     const { mqttResponse, mqttBinding } = this;
    //     const { useCSEID } = config.cseInfo;
    //     let { NOPRINT } = config.setup;
    //     if (jsonObject['m2m:rqp'] !== null) {
    //         const op = jsonObject['m2m:rqp'].op === null ? '' : (jsonObject['m2m:rqp'].op as string);
    //         let to = jsonObject['m2m:rqp'].to === null ? '' : (jsonObject['m2m:rqp'].to as string);

    //         to = to.replace(config.serviceProvider.useServiceProvider + useCSEID + '/', '/');
    //         to = to.replace(useCSEID + '/', '/');

    //         if (to.charAt(0) !== '/') {
    //             to = '/' + to;
    //         }

    //         let fr = jsonObject['m2m:rqp'].fr === null ? '' : (jsonObject['m2m:rqp'].fr as string);
    //         if (fr === '') {
    //             fr = topicArray[3];
    //         }
    //         const rqi = jsonObject['m2m:rqp'].rqi === null ? '' : (jsonObject['m2m:rqp'].rqi as string);
    //         const ty = jsonObject['m2m:rqp'].ty === null ? '' : jsonObject['m2m:rqp'].ty.toString();
    //         const pc = jsonObject['m2m:rqp'].pc === null ? '' : (jsonObject['m2m:rqp'].pc as string);

    //         if ('fc' in jsonObject['m2m:rqp']) {
    //             let queryCount = 0;
    //             for (const fcIndex in jsonObject['m2m:rqp'].fc as Record<string, string>) {
    //                 if (queryCount == 0) {
    //                     to += '?';
    //                     queryCount++;
    //                 } else {
    //                     to += '&';
    //                     queryCount++;
    //                 }
    //                 to += fcIndex;
    //                 to += '=';
    //                 // to += jsonObject['m2m:rqp'].fc[fcIndex].toString();
    //                 to += (jsonObject['m2m:rqp'].fc as Record<string, string>)[fcIndex].toString();
    //             }
    //         }

    //         try {
    //             let responseTopic = '/oneM2M/resp/';
    //             if (topicArray[2] == 'reg_req') {
    //                 responseTopic = '/oneM2M/reg_resp/';
    //             }
    //             const responseTopicRel1 = responseTopic + (topicArray[3] + '/' + topicArray[4]);
    //             responseTopic += topicArray[3] + '/' + topicArray[4] + '/' + topicArray[5];

    //             const response = await mqttBinding(op, to, fr, rqi, ty, pc);
    //             if (response.resBody === '') {
    //                 response.resBody = '{}';
    //             }
    //             mqttResponse(
    //                 responseTopicRel1,
    //                 parseInt(response.res.headers['x-m2m-rsc'] as string),
    //                 op,
    //                 to,
    //                 rqi,
    //                 JSON.parse(response.resBody),
    //             );
    //             mqttResponse(
    //                 responseTopic,
    //                 parseInt(response.res.headers['x-m2m-rsc'] as string),
    //                 op,
    //                 to,
    //                 rqi,
    //                 JSON.parse(response.resBody),
    //             );
    //         } catch (e) {
    //             console.error(e);
    //             let responseTopic = '/oneM2M/resp/';
    //             if (topicArray[2] == 'reg_req') {
    //                 responseTopic = '/oneM2M/reg_resp/';
    //             }
    //             responseTopic += topicArray[3] + '/' + topicArray[4] + '/' + topicArray[5];
    //             mqttResponse(responseTopic, 5000, op, useCSEID, rqi, 'to parsing error');
    //         }
    //     } else {
    //         NOPRINT === true ? (NOPRINT = true) : console.log('mqtt message tag is not different : m2m:rqp');

    //         let responseTopic = '/oneM2M/resp/';
    //         if (topicArray[2] == 'reg_req') {
    //             responseTopic = '/oneM2M/reg_resp/';
    //         }
    //         responseTopic += topicArray[3] + '/' + topicArray[4] + '/' + topicArray[5];
    //         mqttResponse(responseTopic, 4000, '', '', '', '"m2m:dbg":"mqtt message tag is different : m2m:rqp"');
    //     }
    // }

    // private mqttMessageHandler(topic: string, message: Buffer | string) {
    //     const {
    //         cacheTTL,
    //         proxyMqttClient,
    //         httpResponseQueue,
    //         messageCache,
    //         responseMqttRequestIdentifieriArray,
    //         mqttResponse,
    //         mqttMessageAction,
    //     } = this;
    //     const { useCSEID, useCSEBase } = config.cseInfo;
    //     let { NOPRINT } = config.setup;
    //     const topicArray = topic.split('/');
    //     let bodyType = '';
    //     if (topicArray[5] !== null) {
    //         bodyType =
    //             topicArray[5] === 'xml'
    //                 ? topicArray[5]
    //                 : topicArray[5] === 'json'
    //                 ? topicArray[5]
    //                 : topicArray[5] === 'cbor'
    //                 ? topicArray[5]
    //                 : 'json';
    //     } else {
    //         bodyType = config.cseInfo.useDefaultBodyType;
    //         topicArray[5] = bodyType;
    //     }
    //     if (
    //         topicArray[1] === 'oneM2M' &&
    //         topicArray[2] === 'resp' &&
    //         (topicArray[3].replace(':', '/') === useCSEID || topicArray[3] === useCSEID.replace('/', ''))
    //     ) {
    //         try {
    //             const jsonObject = JSON.parse(message.toString());
    //             if (jsonObject['m2m:rsp'] === null) {
    //                 jsonObject['m2m:rsp'] = jsonObject;
    //             }
    //             if (jsonObject['m2m:rsp'] !== null) {
    //                 for (let i = 0; i < responseMqttRequestIdentifieriArray.length; i++) {
    //                     if (responseMqttRequestIdentifieriArray[i] === jsonObject['m2m:rsp'].rqi) {
    //                         NOPRINT === true ? (NOPRINT = true) : console.log('----> ' + jsonObject['m2m:rsp'].rsc);
    //                         httpResponseQueue[responseMqttRequestIdentifieriArray[i]].header(
    //                             'X-M2M-RSC',
    //                             jsonObject['m2m:rsp'].rsc,
    //                         );
    //                         httpResponseQueue[responseMqttRequestIdentifieriArray[i]].header(
    //                             'X-M2M-RI',
    //                             responseMqttRequestIdentifieriArray[i],
    //                         );
    //                         let statusCode = '404';
    //                         if (jsonObject['m2m:rsp'].rsc == '4105') {
    //                             statusCode = '409';
    //                         } else if (jsonObject['m2m:rsp'].rsc == '2000') {
    //                             statusCode = '200';
    //                         } else if (jsonObject['m2m:rsp'].rsc == '2001') {
    //                             statusCode = '201';
    //                         } else if (jsonObject['m2m:rsp'].rsc == '4000') {
    //                             statusCode = '400';
    //                         } else if (jsonObject['m2m:rsp'].rsc == '5000') {
    //                             statusCode = '500';
    //                         }
    //                         httpResponseQueue[responseMqttRequestIdentifieriArray[i]]
    //                             .status(statusCode)
    //                             .end(JSON.stringify(jsonObject['m2m:rsp'].pc));
    //                         delete httpResponseQueue[responseMqttRequestIdentifieriArray[i]];
    //                         responseMqttRequestIdentifieriArray.splice(i, 1);
    //                         break;
    //                     }
    //                 }
    //             }
    //         } catch {
    //             let responseTopic = '/oneM2M/resp/';
    //             responseTopic += topicArray[3] + '/' + topicArray[4] + '/' + topicArray[5];
    //             mqttResponse(responseTopic, 4000, '', '', '', 'to parsing error');
    //         }
    //     } else if (
    //         topicArray[1] === 'oneM2M' &&
    //         topicArray[2] === 'req' &&
    //         (topicArray[4].replace(':', '/') === useCSEID ||
    //             topicArray[4] === useCSEID.replace('/', '') ||
    //             topicArray[4] === useCSEBase)
    //     ) {
    //         NOPRINT === true ? (NOPRINT = true) : console.log('----> [response_mqtt] - ' + topic);
    //         NOPRINT === true ? (NOPRINT = true) : console.log(message.toString());
    //         try {
    //             const jsonObject = JSON.parse(message.toString());
    //             if (jsonObject && jsonObject['m2m:rqp'] == null) {
    //                 jsonObject['m2m:rqp'] = jsonObject;
    //             }
    //             const cacheKey =
    //                 jsonObject['m2m:rqp'].op.toString() +
    //                 jsonObject['m2m:rqp'].to.toString() +
    //                 jsonObject['m2m:rqp'].rqi.toString();
    //             if (cacheKey in messageCache) {
    //                 if (messageCache[cacheKey].to === jsonObject['m2m:rqp'].to) {
    //                     // duplicated message
    //                     //console.log("duplicated message");
    //                     let responseTopic = '/oneM2M/resp/';
    //                     const resp_topic_rel1 = responseTopic + (topicArray[3] + '/' + topicArray[4]);
    //                     responseTopic += topicArray[3] + '/' + topicArray[4] + '/' + topicArray[5];
    //                     if ('rsp' in messageCache[cacheKey]) {
    //                         messageCache[cacheKey].ttl = cacheTTL;
    //                         proxyMqttClient.publish(resp_topic_rel1, messageCache[cacheKey].rsp as string);
    //                         proxyMqttClient.publish(responseTopic, messageCache[cacheKey].rsp as string);
    //                     }
    //                 }
    //             } else {
    //                 // if(Object.keys(messageCache).length >= cache_limit) {
    //                 //     delete messageCache[Object.keys(messageCache)[0]];
    //                 // }
    //                 messageCache[cacheKey] = {};
    //                 messageCache[cacheKey].to = jsonObject['m2m:rqp'].to;
    //                 messageCache[cacheKey].ttl = cacheTTL;
    //                 messageCache[cacheKey].rsp = '';
    //                 mqttMessageAction(topicArray, jsonObject);
    //             }
    //         } catch {
    //             let responseTopic = '/oneM2M/resp/';
    //             responseTopic += topicArray[3] + '/' + topicArray[4] + '/' + topicArray[5];
    //             mqttResponse(responseTopic, 4000, '', '', '', 'to parsing error');
    //         }
    //     } else if (
    //         topicArray[1] === 'oneM2M' &&
    //         topicArray[2] === 'reg_req' &&
    //         (topicArray[4].replace(':', '/') === useCSEID || topicArray[4] === useCSEID.replace('/', ''))
    //     ) {
    //         try {
    //             const jsonObject = JSON.parse(message.toString());
    //             if (jsonObject['m2m:rqp'] === null) {
    //                 jsonObject['m2m:rqp'] = jsonObject;
    //             }
    //             mqttMessageAction(topicArray, jsonObject);
    //         } catch {
    //             let responseTopic = '/oneM2M/resp/';
    //             if (topicArray[2] === 'reg_req') {
    //                 responseTopic = '/oneM2M/reg_resp/';
    //             }
    //             responseTopic += topicArray[3] + '/' + topicArray[4] + '/' + topicArray[5];
    //             mqttResponse(responseTopic, 4000, '', '', '', 'to parsing error');
    //         }
    //     } else {
    //         NOPRINT === true ? (NOPRINT = true) : console.log('topic(' + topic + ') is not supported');
    //     }
    // }

    public initialize(clusterId?: number) {
        const { requestSubscription } = this;
        // const { requestSubscription, registerRequestSubscription } = this;
        const { mqttApp, port } = this;
        const logger = global.getLogger();
        const logCategory = global.getLogCategory('mqttServer', 'listen');

        try {
            http.globalAgent.maxSockets = 1000000;
            http.createServer(mqttApp.callback()).listen({ port: port, agent: false }, async () => {
                if (clusterId) {
                    logger.info(`${logCategory}Proxy mqtt server running at ${port} by Worker[${clusterId}]`);
                } else {
                    logger.info(`${logCategory}CSE server running at ${port} by Primary`);
                }
                const { resCode, resBody } = await httpRetrieveCSEBase();
                if (resCode === '2000') {
                    const jsonObject = JSON.parse(resBody as string);
                    if ('m2m:cb' in jsonObject) {
                        config.cseInfo.useCSEID = jsonObject['m2m:cb'].csi;
                        if (this.proxyMqttClient === null || this.proxyMqttClient === undefined) {
                            this.proxyMqttClient = mqtt.connect(
                                `mqtt://${config.mqttInfo.useMqttBroker}:${config.mqttInfo.useMqttPort}`,
                            );

                            this.proxyMqttClient.on('connect', () => {
                                console.log(this.proxyMqttClient.connected);
                                requestSubscription(this.proxyMqttClient);
                                console.log(this.proxyMqttClient.connected);
                                // registerRequestSubscription();
                                // mqtt_state = 'ready';
                                // require('./mobius/ts_agent');
                            });
                            // proxyMqttClient.on('message', mqttMessageHandler);
                        }
                    } else {
                        logger.info('CSEBase tag is none');
                    }
                } else {
                    logger.error(`Target CSE(${config.mqttInfo.useMqttCSEBaseHost} is not ready`);
                }
            });
        } catch (error) {
            logger.error(logCategory + error);
        }
    }
}
