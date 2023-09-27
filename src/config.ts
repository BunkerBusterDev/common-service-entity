import dotenv from 'dotenv';

dotenv.config();

let { DB_ID: dbId, DB_PW: dbPw } = process.env;

dbId = dbId === undefined ? 'id' : dbId;
dbPw = dbPw === undefined ? 'id' : dbPw;

const managementObjectType = {
    '1001': 'firmware',
    '1006': 'battery',
    '1007': 'deviceInfo',
    '1008': 'deviceCapability',
    '1009': 'reboot',
};

const resourceInfo: { [key: string]: string } = {
    '1': 'acp',
    '2': 'ae',
    '3': 'cnt',
    '4': 'cin',
    '5': 'cb',
    '9': 'grp',
    '10': 'lcp',
    '13': 'mgo',
    '14': 'nod',
    '16': 'csr',
    '17': 'req',
    '23': 'sub',
    '24': 'smd',
    '27': 'mms',
    '29': 'ts',
    '30': 'tsi',
    '38': 'tm',
    '39': 'tr',
    '99': 'rsp',
};

const cseInfo = {
    useCSEType: 'in', // select 'in' or 'mn' or asn'
    useCSEBase: 'Mobius',
    useCSEID: '/Mobius2',
    useDefaultBodyType: 'json',
    useCSEBasePort: '7579',
};

const dbInfo = {
    useDBHost: 'localhost',
    useDBID: dbId,
    useDBPW: dbPw,
};

const proxyInfo = {
    useProxyWSPort: '7577',
    useProxyMqttPort: '7578',
};

const manInfo = {
    useNotificationManPort: '7599',
    useContainerManPort: '7583',
    useHitManPort: '7594',
};

const setup = {
    NOPRINT: true,
    maxLimit: 5000,
    useReleaseVersionIndicator: '2a',
    useCert: 'disable',
    allowedApplicationEntityIDs: [],
    allowedApplicationIDs: [],
    useSecure: 'disable',
    useTimeSeriesAgentPort: '7582',
    useAccessControlPolicy: 'disable',
    useSemanticBroker: '10.10.202.114',
};

const mqttInfo = {
    useMqttBroker: 'localhost',
    useMqttCSEBaseHost: 'localhost',
    useMqttPort: setup.useSecure === 'enable' ? '8883' : '1883',
};

const serviceProvider = {
    useServiceProvider: '//bunkerbuster.co.kr',
    useSuperUser: 'SuperUser',
    useObserver: 'Opserver',
};

const config = {
    cseInfo: cseInfo,
    dbInfo: dbInfo,
    proxyInfo: proxyInfo,
    manInfo: manInfo,
    mqttInfo: mqttInfo,
    serviceProvider: serviceProvider,
    resourceInfo: resourceInfo,
    managementObjectType: managementObjectType,
    setup: setup,
};

export = config;
