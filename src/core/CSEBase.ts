import ip from 'ip';
import moment from 'moment-timezone';

import config from 'config';
import hitModel from 'database/models/hit';
import shortResourceIDModel from 'database/models/shortResourceID';
import lookupModel from 'database/models/lookup';
import CSEBaseModel from 'database/models/CSEBase';

const CreateAction = async () => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('CSEBase', 'CreateAction');
    const rootName = 'cb';
    const responseObject: { [key: string]: string | unknown } = {};
    const resourceObject: { [key: string]: { [key: string]: string | Array<number> | Array<string> } } = {};

    resourceObject[rootName] = {};

    resourceObject[rootName].ty = '5';
    resourceObject[rootName].rn = config.cseInfo.useCSEBase;
    resourceObject[rootName].pi = '';
    // eslint-disable-next-line prettier/prettier
        resourceObject[rootName].ri = `${resourceObject[rootName].pi}/${resourceObject[rootName].rn}`;
    resourceObject[rootName].ct = moment().format('YYYY-MM-DDTHH:mm:ss');
    resourceObject[rootName].lt = resourceObject[rootName].ct;
    resourceObject[rootName].et = moment().add(10, 'years').format('YYYY-MM-DDTHH:mm:ss');
    resourceObject[rootName].acpi = [];
    resourceObject[rootName].lbl = [];
    resourceObject[rootName].lbl[0] = resourceObject[rootName].rn;
    resourceObject[rootName].at = [];
    resourceObject[rootName].aa = [];
    resourceObject[rootName].st = '0';
    resourceObject[rootName].subl = [];
    resourceObject[rootName].csi = config.cseInfo.useCSEID;
    resourceObject[rootName].srv = ['1', '2', '2a'];
    resourceObject[rootName].srt = [1, 2, 3, 4, 5, 9, 10, 13, 14, 16, 17, 23];

    resourceObject[rootName].poa = [
        `http://${ip.address()}:${config.cseInfo.useCSEBasePort}`,
        `mqtt://${ip.address()}:${config.mqttInfo.useMqttPort}/${resourceObject[rootName].csi.replace('/', '')}`,
        // `coap://${ip.address()}:${config.cseInfo.useCSEBasePort}`,
        // `ws://${ip.address()}:${config.proxyInfo.useProxyWsPort}`,
    ];

    resourceObject[rootName].nl = '';
    resourceObject[rootName].ncp = '';
    resourceObject[rootName].cst = '1';

    const resultFindIsExistByri = await lookupModel.findIsExistByresourceID(resourceObject[rootName].ri);
    logger.info(`${logCategory}Find resourceID in lookup by resourceID: ${resourceObject[rootName].ri}`);
    if (resultFindIsExistByri != null) {
        try {
            await CSEBaseModel.updateCSEBase(
                resourceObject[rootName].ri,
                JSON.stringify(resourceObject[rootName].poa),
                resourceObject[rootName].csi,
                JSON.stringify(resourceObject[rootName].srt),
            );
            config.cseInfo.useCSEID = resourceObject[rootName].csi;
            logger.info(`${logCategory}Update CSEBase: ${resourceObject[rootName].ri}`);
        } catch (error) {
            responseObject.ri = resourceObject[rootName].ri;
            responseObject.error = error;
            logger.error(`${logCategory}Update CSEBase failed\n${JSON.stringify(responseObject)}`);
        }
    } else {
        const resultFindsriBypi = await shortResourceIDModel.findShortResourceIDByParentID(resourceObject[rootName].pi);
        logger.info(`${logCategory}Find resourceID in shortResourceID by parentID ${resourceObject[rootName].pi}`);

        resourceObject[rootName].spi = resultFindsriBypi === null ? '' : resultFindsriBypi.sri;
        resourceObject[rootName].sri = `5-${resourceObject[rootName].ct}`;
        try {
            await lookupModel.insertLookup(resourceObject[rootName]);
            logger.info(`${logCategory}Insert lookup: ${resourceObject[rootName].ri}`);
            try {
                await shortResourceIDModel.insertShortResourceID(resourceObject[rootName]);
                logger.info(`${logCategory}Insert shortResourceID: ${resourceObject[rootName].ri}`);

                try {
                    await CSEBaseModel.insertCSEBase(resourceObject[rootName]);
                    logger.info(`${logCategory}Insert CSEBase: ${resourceObject[rootName].ri}`);
                } catch (error) {
                    await lookupModel.deleteLookupByResourceID(resourceObject[rootName].ri);
                    await shortResourceIDModel.deleteShortResourceID(resourceObject[rootName].ri);
                    await CSEBaseModel.deleteCSEBase(resourceObject[rootName].ri);
                    responseObject.ri = resourceObject[rootName].ri;
                    responseObject.error = error;
                    logger.error(`${logCategory}Insert CSEBase failed\n${JSON.stringify(responseObject)}`);
                }
            } catch (error) {
                await lookupModel.deleteLookupByResourceID(resourceObject[rootName].ri);
                responseObject.ri = resourceObject[rootName].ri;
                responseObject.error = error;
                logger.error(`${logCategory}Insert shortResourceID failed\n${JSON.stringify(responseObject)}`);
            }
        } catch (error) {
            responseObject.ri = resourceObject[rootName].ri;
            responseObject.error = error;
            logger.error(`Insert lookup failed\n${JSON.stringify(responseObject)}`);
        }
    }
};

const create = async () => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('CSEBase', 'create');
    const ct = moment().format('YYYY-MM-DD');

    try {
        await hitModel.findOneAndUpdate(
            { ct: new Date(ct) },
            { $inc: { http: 1, mqtt: 1, coap: 1, ws: 1 } },
            { upsert: true },
        );
        await CreateAction();
    } catch (error) {
        logger.error(logCategory + error);
    }
};

const CSEBase = {
    create: create,
};

export = CSEBase;
