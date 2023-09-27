import koa from 'koa';

import config from 'config';
import { getType } from 'lib/util';

const typeCheckAction = (
    index1: string,
    bodyObject2: { [key2: string]: string | number | boolean | Array<string> },
) => {
    for (const index2 in bodyObject2) {
        if (
            bodyObject2[index2] === null ||
            bodyObject2[index2] === '' ||
            bodyObject2[index2] === undefined ||
            bodyObject2[index2] === '[]' ||
            bodyObject2[index2] === '""'
        ) {
            if (index2 !== 'pi' && index2 !== 'pv') {
                delete bodyObject2[index2];
            }
        } else if (index2 === 'subl') {
            delete bodyObject2[index2];
        } else if (index2 === 'et') {
            if (index1 === 'm2m:cb') {
                delete bodyObject2[index2];
            }
        } else if (index2 === 'cr') {
            if (index1 === 'm2m:ae' || index1 === 'm2m:csr') {
                delete bodyObject2[index2];
            }
        } else if (
            index2 === 'acp' ||
            index2 === 'cst' ||
            index2 === 'los' ||
            index2 === 'mt' ||
            index2 === 'csy' ||
            index2 === 'nct' ||
            index2 === 'cs' ||
            index2 === 'st' ||
            index2 === 'ty' ||
            index2 === 'cbs' ||
            index2 === 'cni' ||
            index2 === 'mni' ||
            index2 === 'cnm' ||
            index2 === 'mia' ||
            index2 === 'mbs' ||
            index2 === 'mgd' ||
            index2 === 'btl' ||
            index2 === 'bts' ||
            index2 === 'mdn' ||
            index2 === 'mdc' ||
            index2 === 'mdt' ||
            index2 === 'pei' ||
            index2 === 'mnm' ||
            index2 === 'exc' ||
            index2 === 'rs' ||
            index2 === 'ors'
        ) {
            if (
                (index1 === 'm2m:cb' ||
                    index1 === 'm2m:cin' ||
                    index1 === 'm2m:nod' ||
                    index1 === 'm2m:ae' ||
                    index1 === 'm2m:sub' ||
                    index1 === 'm2m:acp' ||
                    index1 === 'm2m:csr' ||
                    index1 === 'm2m:grp' ||
                    index1 === 'm2m:fwr' ||
                    index1 === 'm2m:bat' ||
                    index1 === 'm2m:dvi' ||
                    index1 === 'm2m:dvc' ||
                    index1 === 'm2m:rbo' ||
                    index1 === 'm2m:smd' ||
                    index1 === 'm2m:tr' ||
                    index1 === 'm2m:tm') &&
                index2 === 'mni'
            ) {
                delete bodyObject2[index2];
            } else if (
                (index1 === 'm2m:cb' ||
                    index1 === 'm2m:csr' ||
                    index1 === 'm2m:ae' ||
                    index1 === 'm2m:acp' ||
                    index1 === 'm2m:grp' ||
                    index1 === 'm2m:sub' ||
                    index1 === 'm2m:nod' ||
                    index1 === 'm2m:fwr' ||
                    index1 === 'm2m:bat' ||
                    index1 === 'm2m:dvi' ||
                    index1 === 'm2m:dvc' ||
                    index1 === 'm2m:rbo' ||
                    index1 === 'm2m:tr' ||
                    index1 === 'm2m:tm') &&
                index2 === 'st'
            ) {
                delete bodyObject2[index2];
            } else {
                bodyObject2[index2] = parseInt(bodyObject2[index2] as string);
            }
        } else if (
            index2 === 'srv' ||
            index2 === 'aa' ||
            index2 === 'at' ||
            index2 === 'poa' ||
            index2 === 'lbl' ||
            index2 === 'acpi' ||
            index2 === 'srt' ||
            index2 === 'nu' ||
            index2 === 'mid' ||
            index2 === 'macp'
        ) {
            if (index1 === 'm2m:acp' && index2 === 'acpi') {
                delete bodyObject2[index2];
            }

            if (!Array.isArray(bodyObject2[index2])) {
                bodyObject2[index2] = JSON.parse(bodyObject2[index2] as string);
            }

            if (index2 === 'mid') {
                const bodyObject3: Array<string> = bodyObject2[index2] as Array<string>;
                if (bodyObject3.length > 0) {
                    for (const index3 in bodyObject3) {
                        bodyObject3[index3] = bodyObject3[index3].replace(
                            config.serviceProvider.useServiceProvider + config.cseInfo.useCSEID + '/',
                            '/',
                        ); // absolute
                        bodyObject3[index3] = bodyObject3[index3].replace(config.cseInfo.useCSEID + '/', '/'); // SP
                        if (bodyObject3[index3].charAt(0) === '/') {
                            bodyObject3[index3] = bodyObject3[index3].replace('/', '');
                        }
                    }
                    bodyObject2[index2] = bodyObject3;
                }
            }
        } else if (index2 === 'enc') {
            if (Object.keys(bodyObject2[index2])[0] !== 'net') {
                bodyObject2[index2] = JSON.parse(bodyObject2[index2] as string);
            }
        } else if (index2 === 'bn') {
            if (Object.keys(bodyObject2[index2]).length === 0) {
                delete bodyObject2[index2];
            }
        } else if (
            index2 === 'rr' ||
            index2 === 'mtv' ||
            index2 === 'ud' ||
            index2 === 'att' ||
            index2 === 'cus' ||
            index2 === 'ena' ||
            index2 === 'dis' ||
            index2 === 'rbo' ||
            index2 === 'far' ||
            index2 === 'mdd' ||
            index2 === 'disr'
        ) {
            bodyObject2[index2] = bodyObject2[index2] === 'true' || bodyObject2[index2] === true;
        } else if (index2 === 'sri') {
            bodyObject2.ri = bodyObject2[index2];
            delete bodyObject2[index2];
        } else if (index2 === 'spi') {
            bodyObject2.pi = bodyObject2[index2];
            delete bodyObject2[index2];
        } else if (index2 === 'pv' || index2 === 'pvs') {
            if (getType(bodyObject2[index2]) === 'string') {
                bodyObject2[index2] = JSON.parse(bodyObject2[index2] as string);
            }
        }
    }
};

const typeCheckforJson = (bodyObject: {
    [key1: string]: { [key2: string]: string | number | boolean | Array<string> };
}) => {
    for (const index1 in bodyObject) {
        if (index1 in bodyObject) {
            typeCheckAction(index1, bodyObject[index1]);
        }
    }
};

const responseResult = async function (ctx: koa.DefaultContext, status: number, rsc: string) {
    const bodyObject = ctx.request.resourceObject;

    if ('x-m2m-ri' in ctx.request.headers) {
        ctx.set('X-M2M-RI', ctx.request.headers['x-m2m-ri']);
    }

    if ('x-m2m-rvi' in ctx.request.headers) {
        ctx.set('X-M2M-RVI', ctx.request.headers['x-m2m-rvi']);
    }

    if ('accept' in ctx.request.headers) {
        ctx.set('Accept', ctx.request.headers['accept']);

        if (ctx.request.headers['accept'].includes('xml')) {
            ctx.request.useBodyType = 'xml';
            ctx.set('Content-Type', 'application/xml');
        } else if (ctx.request.headers['accept'].includes('cbor')) {
            ctx.request.useBodyType = 'cbor';
            ctx.set('Content-Type', 'application/cbor');
        } else {
            ctx.request.useBodyType = 'json';
            ctx.set('Content-Type', 'application/json');
        }
    }

    if ('locale' in ctx.request.headers) {
        ctx.set('Locale', ctx.request.headers['locale']);
    }

    ctx.set('X-M2M-RSC', rsc);

    if (ctx.request.query.responseType === 3) {
        const checkHeader = ['x-m2m-ri', 'x-m2m-rvi', 'locale', 'accept'];
        for (const index in checkHeader) {
            const check = checkHeader[index];
            if (!(check in ctx.request.headers)) {
                if (check === 'accept') {
                    ctx.request.useBodyType = 'json';
                    ctx.set('Content-Type', 'application/json');
                }
            }
        }
    }

    const rootName = Object.keys(bodyObject)[0];
    bodyObject['m2m:' + rootName] = bodyObject[rootName];
    delete bodyObject[rootName];

    typeCheckforJson(bodyObject);

    if (rootName === 'req') {
        bodyObject['m2m:' + rootName].pc = JSON.parse(bodyObject['m2m:' + rootName].pc);
        if (Object.keys(bodyObject['m2m:' + rootName].pc)[0] === 'm2m:uril') {
            bodyObject['m2m:' + rootName].pc['m2m:uril'] = bodyObject['m2m:' + rootName].pc['m2m:uril'].split(' ');
        }
    }

    const bodyString = JSON.stringify(bodyObject);

    if (ctx.request.query.responseType === 3) {
        ctx.status = status;
        ctx.body = bodyString;
        return;
    }
};

export = { responseResult };
