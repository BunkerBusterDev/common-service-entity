import koa from 'koa';
import koaMorgan from 'koa-morgan';
import koaConvert from 'koa-convert';
import koaBody from 'koa-better-body';
import moment from 'moment-timezone';

import config from 'config';
import util from 'lib/util';
import { httpLogStream } from 'lib/winston';

import resource from 'core/resource';
// import security from 'core/security';
import transaction from 'core/transaction';
import responseder from 'core/responseder';

import hitModel from 'database/models/hit';

const loggerStream = global.getLogger('httpMiddlewares', 'morgan');
const morgan = koaMorgan('combined', { stream: httpLogStream(loggerStream) });

const bodyParser = koaConvert(
    koaBody({
        multipart: true,
        fields: 'body', // 파싱된 결과를 ctx.request.body에 저장
        textLimit: '5mb', // 텍스트 본문의 최대 크기
        extendTypes: {
            // 파싱할 컨텐트 타입
            text: [
                'application/onem2m-resource+xml',
                'application/xml',
                'application/json',
                'application/vnd.onem2m-res+xml',
                'application/vnd.onem2m-res+json',
            ],
        },
    }),
);

const crossOriginResourceSharing = (ctx: koa.DefaultContext, next: koa.Next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    ctx.set(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, X-M2M-RI, X-M2M-RVI, X-M2M-RSC, Accept, X-M2M-Origin, Locale',
    );
    ctx.set(
        'Access-Control-Expose-Headers',
        'Origin, X-Requested-With, Content-Type, X-M2M-RI, X-M2M-RVI, X-M2M-RSC, Accept, X-M2M-Origin, Locale',
    );

    if (ctx.request.method === 'OPTIONS') {
        ctx.status = 200;
        return;
    } else {
        return next();
    }
};

const checkBind = async (ctx: koa.DefaultContext, next: koa.Next) => {
    if (ctx.request.headers.binding === undefined) {
        ctx.request.headers.binding = 'http';
    } else if (ctx.request.headers.binding === 'H') {
        ctx.request.headers.binding = 'http';
    } else if (ctx.request.headers.binding === 'M') {
        ctx.request.headers.binding = 'mqtt';
    } else if (ctx.request.headers.binding === 'C') {
        ctx.request.headers.binding = 'coap';
    } else if (ctx.request.headers.binding === 'W') {
        ctx.request.headers.binding = 'ws';
    }

    try {
        const ct = moment().format('YYYY-MM-DD');

        await hitModel.findOneAndUpdate(
            { ct: new Date(ct) },
            { $inc: { [ctx.request.headers.binding]: 1 } },
            { upsert: true },
        );
        return next();
    } catch (error) {
        const logger = global.getLogger();
        const logCategory = global.getLogCategory('httpServer', 'checkBind');
        logger.error(logCategory + error);
        return;
    }
};

const checkXm2mHeaders = async (ctx: koa.DefaultContext, next: koa.Next) => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('middlewares', 'checkXm2mHeaders');

    // Check X-M2M-RI Header
    if ('x-m2m-ri' in ctx.request.headers) {
        if (ctx.request.headers['x-m2m-ri'] === '') {
            logger.error(`${logCategory}400-1`);
            return;
        }
    }

    // Check X-M2M-RVI Header
    if (!('x-m2m-rvi' in ctx.request.headers)) {
        ctx.request.headers['x-m2m-rvi'] = config.setup.useReleaseVersionIndicator;
    }

    ctx.request.ty = '99';
    if ('content-type' in ctx.request.headers) {
        let contentType = ctx.request.headers['content-type'].split(';');
        for (const i in contentType) {
            if (i in contentType) {
                const typeArray = contentType[i].replace(/ /g, '').split('=');
                if (typeArray[0].replace(/ /g, '') === 'ty') {
                    ctx.request.ty = typeArray[1].replace(' ', '');
                    contentType = null;
                    break;
                }
            }
        }

        if (ctx.request.ty === '5') {
            logger.error(`${logCategory}405-1`);
            return;
        }

        if (ctx.request.ty === '17') {
            logger.error(`${logCategory}405-2`);
            return;
        }

        if (ctx.request.headers['content-type'].includes('xml')) {
            ctx.request.useBodyType = 'xml';
        } else if (ctx.request.headers['content-type'].includes('cbor')) {
            ctx.request.useBodyType = 'cbor';
        } else {
            ctx.request.useBodyType = 'json';
        }
    } else {
        ctx.request.useBodyType = 'json';
    }

    // Check X-M2M-Origin Header
    if ('x-m2m-origin' in ctx.request.headers) {
        if (ctx.request.headers['x-m2m-origin'] === '') {
            if (ctx.request.ty === '2' || ctx.request.ty === '16') {
                ctx.request.headers['x-m2m-origin'] = 'S';
            } else {
                logger.error(`${logCategory}405-2`);
                return;
            }
        }
    } else {
        logger.error(`${logCategory}405-2`);
        return;
    }

    if (!('filterUsage' in ctx.request.query)) {
        ctx.request.query.filterUsage = 2;
    }

    if (!('resultContent' in ctx.request.query)) {
        ctx.request.query.resultContent = 1;
    }

    if (!('responseType' in ctx.request.query)) {
        ctx.request.query.responseType = 3;
    }

    let allow = 1;
    if (config.setup.allowedApplicationEntityIDs.length > 0) {
        allow = 0;
        for (const idx in config.setup.allowedApplicationEntityIDs) {
            if (idx in config.setup.allowedApplicationEntityIDs) {
                if (config.cseInfo.useCSEID == ctx.request.headers['x-m2m-origin']) {
                    allow = 1;
                    break;
                } else if (config.setup.allowedApplicationEntityIDs[idx] == ctx.request.headers['x-m2m-origin']) {
                    allow = 1;
                    break;
                }
            }
        }

        if (allow == 0) {
            logger.error(`${logCategory}403-1`);
            return;
        }
    }

    if (ctx.request.url === '/hit' || ctx.request.url === `/${config.cseInfo.useCSEBase}`) {
        return next();
    } else {
        if (!(ctx.request.ty in util.getrns())) {
            logger.error(`${logCategory}405-3`);
            return;
        }
    }
    return next();
};

const getTarget = (ctx: koa.DefaultContext, next: koa.Next) => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('middlewares', 'getTarget');
    ctx.request.url = ctx.request.url.replace('%23', '#'); // convert '%23' to '#' of url
    // console.log(ctx.request.url);
    const hashValue = ctx.request.url.split('#')[1];
    ctx.request.hash = hashValue ? `#${hashValue}` : null;
    let absoluteUrl = ctx.request.url.replace('/_/', '//').split('#')[0];
    absoluteUrl = absoluteUrl.replace(config.serviceProvider.useServiceProvider, '/~');
    // eslint-disable-next-line no-useless-escape
    absoluteUrl = absoluteUrl.replace(/\/~\/[^\/]+\/?/, '/');
    // console.log(absoluteUrl);
    const absoluteUrlArray = absoluteUrl.split('/');
    // console.log(absoluteUrlArray);

    logger.debug(`${logCategory}${ctx.request.method}: ${ctx.request.url}`);
    ctx.request.bodyObj = {};

    ctx.request.headers.option = '';
    ctx.request.sri = absoluteUrlArray[1].split('?')[0];
    if (
        absoluteUrlArray[absoluteUrlArray.length - 1] === 'la' ||
        absoluteUrlArray[absoluteUrlArray.length - 1] === 'latest'
    ) {
        if (ctx.request.method.toLowerCase() === 'get' || ctx.request.method.toLowerCase() === 'delete') {
            ctx.request.ri = absoluteUrl.split('?')[0].replace('/latest', '');
            ctx.request.ri = ctx.request.ri.replace('/la', '');
            ctx.request.option = '/latest';
        } else {
            logger.error(`${logCategory}409-1`);
        }
    } else if (
        absoluteUrlArray[absoluteUrlArray.length - 1] == 'ol' ||
        absoluteUrlArray[absoluteUrlArray.length - 1] == 'oldest'
    ) {
        if (ctx.request.method.toLowerCase() == 'get' || ctx.request.method.toLowerCase() == 'delete') {
            ctx.request.ri = absoluteUrl.split('?')[0].replace('/oldest', '');
            ctx.request.ri = ctx.request.ri.replace('/ol', '');
            ctx.request.option = '/oldest';
        } else {
            logger.error(`${logCategory}409-2`);
        }
    } else if (absoluteUrlArray[absoluteUrlArray.length - 1] == 'fopt') {
        ctx.request.ri = absoluteUrl.split('?')[0].replace('/fopt', '');
        ctx.request.option = '/fopt';
    } else {
        ctx.request.ri = absoluteUrl.split('?')[0];
        ctx.request.option = '';
    }

    ctx.request.absoluteUrl = absoluteUrl;
    absoluteUrl = null;
    return next();
};

const checkResponseType = (ctx: koa.DefaultContext) => {
    return new Promise<number>((resolve) => {
        if (ctx.request.query.responseType === 3) {
            // default, blocking
            resolve(200);
        } else if (ctx.request.query.rt === 1 || ctx.request.query.rt === 2) { // nonblocking
            if (ctx.request.query.rt === 2 && ctx.request.headers['x-m2m-rtu'] === null && ctx.request.headers['x-m2m-rtu'] === '') {
                resolve(400);
            }
            else {
                // first create ctx.request resource under CSEBase
                var tempRootName = ctx.request.headers.rootName;
                var tempBodyObject = JSON.parse(JSON.stringify(ctx.request.bodyObject));
                var tempResourceType = ctx.request.ty;
    
    
                ctx.request.ty = '17';
                var rtBodyObject = {req: {}};
                ctx.request.headers.rootName = 'req';
                ctx.request.bodyObject = rtBodyObject;
                ctx.request.query.rt = 3;
    
                const code = await resource.create(ctx.request);
                    if(code === 200) {
                        ctx.request.ty = tempResourceType;
                        ctx.request.headers.rootName = tempRootName;
                        ctx.request.bodyObject = tempBodyObject;
                        ctx.request.query.rt = 1;
                        resolve(code);
                    }
                    else {
                        resolve(code);
                    }
            }
        }
        else {
            resolve(405);
        }
    });
};

const lookupCreate = async (ctx: koa.DefaultContext) => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('cseControl', 'lookupCreate');
    logger.debug(logCategory + ctx.request);

    const code = await checkResponseType(ctx);
    if (code === 200) {

    }
};

const lookupRetrieve = async (ctx: koa.DefaultContext) => {
    const code = await checkResponseType(ctx);
    if (code === 200) {
        const resultObject = ctx.request.targetObject[Object.keys(ctx.request.targetObject)[0]];
        console.log(resultObject);
        const code = await transaction.check(ctx.request);
        if (code === 200) {
            if (resultObject.ty == 2) {
                resultObject.cr = resultObject.aei;
            } else if (resultObject.ty == 16) {
                resultObject.cr = resultObject.csi;
            }

            if (ctx.request.query.fu == 1) {
                const code = await resource.retrieve(ctx);
                await responseder.responseResult(ctx, code, '2000');
            } else {
                const code = await resource.retrieve(ctx);
                await responseder.responseResult(ctx, code, '2000');
            }
        } else {
            ctx.status = code;
        }
    } else {
        ctx.status = '405-4';
    }
};

export = {
    morgan,
    bodyParser,
    crossOriginResourceSharing,
    checkBind,
    checkXm2mHeaders,
    getTarget,
    lookupCreate,
    lookupRetrieve,
};
