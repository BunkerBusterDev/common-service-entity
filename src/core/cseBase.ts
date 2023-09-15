import ip from 'ip';
import moment from 'moment-timezone';

import config from 'config';
import hitModel from 'database/models/hit';
import shortResourceIDModel from 'database/models/shortResourceID';
import lookupModel from 'database/models/lookup';
import cseBaseModel from 'database/models/cseBase';

export default class CSEBase {
    constructor() {}

    private async cseBaseCreateAction() {
        const logger = global.getLogger('cseBase', 'cseBaseCreateAction');
        const rootName = 'cseBase';
        const responseObject: { [key: string]: string | unknown } = {};
        const resourceObject: { [key: string]: { [key: string]: string | Array<string> } } = {};

        resourceObject[rootName] = {};

        resourceObject[rootName].resourceType = '5';
        resourceObject[rootName].resourceName = config.cseInfo.useCseBase;
        resourceObject[rootName].parentID = '';
        // eslint-disable-next-line prettier/prettier
        resourceObject[rootName].resourceID = `${resourceObject[rootName].parentID}/${resourceObject[rootName].resourceName}`;
        resourceObject[rootName].creationTime = moment().format('YYYY-MM-DDTHH:mm:ss');
        resourceObject[rootName].lastModifiedTime = resourceObject[rootName].creationTime;
        resourceObject[rootName].expirationTime = moment().add(10, 'years').format('YYYY-MM-DDTHH:mm:ss');
        resourceObject[rootName].accessControlPolicyIDs = [];
        resourceObject[rootName].labels = [];
        resourceObject[rootName].labels[0] = resourceObject[rootName].resourceName;
        resourceObject[rootName].announceTo = [];
        resourceObject[rootName].announcedAttribute = [];
        resourceObject[rootName].stateTag = '0';
        resourceObject[rootName].supportedReleaseVersions = [];
        resourceObject[rootName].subscribedResourceList = [];

        resourceObject[rootName].supportedReleaseVersions.push('1');
        resourceObject[rootName].supportedReleaseVersions.push('2');
        resourceObject[rootName].supportedReleaseVersions.push('2a');

        resourceObject[rootName].cseID = config.cseInfo.useCseId;
        // eslint-disable-next-line prettier/prettier
        resourceObject[rootName].supportedResourceType = ['1', '2', '3', '4', '5', '9', '10', '13', '14', '16', '17', '23'];

        resourceObject[rootName].pointOfAcess = [];
        resourceObject[rootName].pointOfAcess.push(`http://${ip.address()}:${config.cseInfo.useCseBasePort}`);
        // resourceObject[rootName].pointOfAcess.push(
        //     `mqtt://${ip.address()}:${config.mqttInfo.useMqttPort}/${resourceObject[rootName].cseID.replace('/', '')}`,
        // );
        // resourceObject[rootName].pointOfAcess.push(`coap://${ip.address()}:${config.cseInfo.useCseBasePort}`);
        // resourceObject[rootName].pointOfAcess.push(`ws://${ip.address()}:${config.proxyInfo.useProxyWsPort}`);

        resourceObject[rootName].nodeLink = '';
        resourceObject[rootName].notificationCongestionPolicy = '';
        resourceObject[rootName].cseType = '1';

        const resultFindIsExistByResourceID = await lookupModel.findIsExistByResourceID(
            resourceObject[rootName].resourceID,
        );
        logger.info(`Find resourceID in lookup by resourceID${resourceObject[rootName].resourceID}`);
        if (resultFindIsExistByResourceID != null) {
            try {
                await cseBaseModel.updateCseBase(
                    resourceObject[rootName].resourceID,
                    JSON.stringify(resourceObject[rootName].pointOfAcess),
                    resourceObject[rootName].cseID,
                    JSON.stringify(resourceObject[rootName].supportedResourceType),
                );
                config.cseInfo.useCseId = resourceObject[rootName].cseID;
                logger.info(`Update cseBase : ${resourceObject[rootName].resourceID}`);
            } catch (error) {
                responseObject.resourceID = resourceObject[rootName].resourceID;
                responseObject.error = error;
                logger.error(`Update cseBase failed\n${JSON.stringify(responseObject)}`);
            }
        } else {
            const resultFindShortResourceIDByParentID = await shortResourceIDModel.findShortResourceIDByParentID(
                resourceObject[rootName].parentID,
            );
            logger.info(`Find resourceID in shortResourceID by ParentID ${resourceObject[rootName].parentID}`);

            resourceObject[rootName].shortParentID =
                resultFindShortResourceIDByParentID === null ? '' : resultFindShortResourceIDByParentID.shortResourceID;
            resourceObject[rootName].shortResourceID = `5-${resourceObject[rootName].creationTime}`;
            try {
                await lookupModel.insertLookup(resourceObject[rootName]);
                logger.info(`Insert lookup : ${resourceObject[rootName].resourceID}`);
                try {
                    await shortResourceIDModel.insertShortResourceID(resourceObject[rootName]);
                    logger.info(`Insert shortResourceID : ${resourceObject[rootName].resourceID}`);

                    try {
                        await cseBaseModel.insertCseBase(resourceObject[rootName]);
                        logger.info(`Insert cseBase : ${resourceObject[rootName].resourceID}`);
                    } catch (error) {
                        await lookupModel.deleteLookupByResourceID(resourceObject[rootName].resourceID);
                        await shortResourceIDModel.deleteShortResourceID(resourceObject[rootName].resourceID);
                        await cseBaseModel.deleteCseBase(resourceObject[rootName].resourceID);
                        responseObject.resourceID = resourceObject[rootName].resourceID;
                        responseObject.error = error;
                        logger.error(`Insert cseBase failed\n${JSON.stringify(responseObject)}`);
                    }
                } catch (error) {
                    await lookupModel.deleteLookupByResourceID(resourceObject[rootName].resourceID);
                    responseObject.resourceID = resourceObject[rootName].resourceID;
                    responseObject.error = error;
                    logger.error(`Insert shortResourceID failed\n${JSON.stringify(responseObject)}`);
                }
            } catch (error) {
                responseObject.resourceID = resourceObject[rootName].resourceID;
                responseObject.error = error;
                logger.error(`Insert lookup failed\n${JSON.stringify(responseObject)}`);
            }
        }
    }

    public async create() {
        const logger = global.getLogger('cseBase', 'cseBaseCreateAction');
        const creationTime = moment().format('YYYYMMDD');

        try {
            await hitModel.findOneAndUpdate(
                { creationTime: creationTime },
                { $inc: { http: 1, mqtt: 1, coap: 1, ws: 1 } },
                { upsert: true },
            );
            await this.cseBaseCreateAction();
        } catch (error) {
            logger.error(error);
        }
    }
}
