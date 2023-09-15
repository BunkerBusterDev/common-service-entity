import dotenv from 'dotenv';

dotenv.config();

let { DB_ID: dbId, DB_PW: dbPw, PORT: cseBasePort } = process.env;

cseBasePort = cseBasePort === undefined ? 'id' : cseBasePort;
dbId = dbId === undefined ? 'id' : dbId;
dbPw = dbPw === undefined ? 'id' : dbPw;

const cseInfo = {
    useCseType: 'in', // select 'in' or 'mn' or asn'
    useCseBase: 'Mobius',
    useCseId: '/Mobius2',
    useDefaultBodyType: 'json',
    useCseBasePort: cseBasePort,
};

const dbInfo = {
    useDbHost: 'localhost',
    useDbId: dbId,
    useDbPass: dbPw,
};

const proxyInfo = {
    useProxyWsPort: '7577',
    useProxyMqttPort: '7578',
};

const manInfo = {
    useSgnManPort: '7599',
    useCntManPort: '7583',
    useHitManPort: '7594',
};

const mqttInfo = {
    useMqttBroker: 'localhost',
    useMqttPort: '1883',
};

const config = {
    cseInfo: cseInfo,
    dbInfo: dbInfo,
    proxyInfo: proxyInfo,
    manInfo: manInfo,
    mqttInfo: mqttInfo,
};

export = config;
