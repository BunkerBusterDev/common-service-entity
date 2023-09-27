import koa from 'koa';
// import moment from 'moment-timezone';

import config from 'config';

const setrootName = (request: koa.DefaultContext, ty: string) => {
    request.headers.rootName = config.resourceInfo[ty];
};

const removeNoValue = (request: koa.DefaultContext, resourceObject: { [key: string]: { [key: string]: string } }) => {
    const rootName = request.headers.rootName;

    for (const index in resourceObject[rootName]) {
        if (index in resourceObject[rootName]) {
            if (request.hash) {
                if (request.hash.split('#')[1] !== index) {
                    delete resourceObject[rootName][index];
                }
            } else {
                if (typeof resourceObject[rootName][index] === 'boolean') {
                    resourceObject[rootName][index] = resourceObject[rootName][index].toString();
                } else if (typeof resourceObject[rootName][index] === 'string') {
                    if (
                        resourceObject[rootName][index] === '' ||
                        resourceObject[rootName][index] === 'undefined' ||
                        resourceObject[rootName][index] === '[]'
                    ) {
                        delete resourceObject[rootName][index];
                    }
                } else if (typeof resourceObject[rootName][index] === 'number') {
                    resourceObject[rootName][index] = resourceObject[rootName][index].toString();
                }
            }
        }
    }
};

const retrieve = async (ctx: koa.DefaultContext) => {
    ctx.request.resourceObject = JSON.parse(JSON.stringify(ctx.request.targetObject));
    const rootName = Object.keys(ctx.request.targetObject)[0];

    const ty = ctx.request.resourceObject[rootName].ty;
    const resourceObject = ctx.request.resourceObject;

    if (ctx.request.query.filterUsage === 2 && ctx.request.query.resultContent === 1) {
        setrootName(ctx.request, ty);
        removeNoValue(ctx.request, resourceObject);

        return 200;
    }
    return 200;
    // } else if (ctx.request.query.filterUsage == 1 && ctx.request.query.smf) {
    //     const code = await semanticDescriptor.requestGetDiscovery(ctx);
    //     return code;
    // } else {
    //     ctx.request.headers.rootName = 'agr';

    //     const foundParentList = [];
    //     const riList = [];
    //     let piList = [];
    //     piList.push(resourceObject[rootName].ri);
    //     const foundObject = {};

    //     const code = await presearchAction(ctx, piList, foundParentList);
    //     if (code === '200') {
    //         piList = [];
    //         piList.push(resourceObject[rootName].ri);
    //         const pathArray = ctx.request.url.split('?')[0].split('/');
    //         const pathlength = pathArray.length;
    //         const currentLevel = parseInt(pathlength, 10) - 2;
    //         for (let i = 0; i < foundParentList.length; i++) {
    //             if (ctx.request.query.level !== null) {
    //                 const level = ctx.request.query.level;
    //                 if (foundParentList[i].ri.split('/').length - 1 <= currentLevel + parseInt(level, 10)) {
    //                     piList.push(foundParentList[i].ri);
    //                 }
    //             } else {
    //                 piList.push(foundParentList[i].ri);
    //             }
    //         }

    //         const currentDateTime = moment().add(1, 'd').utc().format('YYYY-MM-DD HH:mm:ss');
    //         const code = await db_sql.search_lookup(resourceObject[rootName].ri, ctx.request.query, ctx.request.query.limit, piList, 0, foundObject, 0, ctx.request.query.currentNrOfInstances, currentDateTime, 0);           );
    //         if (code === '200') {
    //             const code = await db_sql.select_spec_ri(ctx.request.connection, foundObject, 0);
    //             if (code === '200') {
    //                 if (Object.keys(foundObject).length >= 1) {
    //                     if (Object.keys(foundObject).length >= config.setup.maxLimit) {
    //                         ctx.set('X-M2M-CTS', 1);

    //                         if (ctx.request.query.ofst != null) {
    //                             ctx.set(
    //                                 'X-M2M-CTO',
    //                                 parseInt(ctx.request.query.ofst, 10) + Object.keys(foundObject).length,
    //                             );
    //                         } else {
    //                             ctx.set('X-M2M-CTO', Object.keys(foundObject).length);
    //                         }
    //                     }

    //                     for (const index in foundObject) {
    //                         if (foundObject.hasOwnProperty(index)) {
    //                             riList.push(foundObject[index].ri);
    //                         }
    //                     }
    //                 }

    //                 if (ctx.request.query.filterUsage == 1) {
    //                     ctx.request.headers.rootName = 'uril';
    //                     await makeCSERelative(riList);
    //                     ctx.request.resourceObject = {};
    //                     ctx.request.resourceObject.uril = {};
    //                     ctx.request.resourceObject.uril = riList;

    //                     return '200-1';
    //                 } else if (
    //                     ctx.request.query.resultContent == 4 ||
    //                     ctx.request.query.resultContent == 5 ||
    //                     ctx.request.query.resultContent == 6
    //                 ) {
    //                     ctx.request.headers.rootName = 'rsp';
    //                     ctx.request.resourceObject = JSON.parse(JSON.stringify(foundObject));
    //                     removeNoValue(ctx.request, ctx.request.resourceObject);

    //                     return '200-1';
    //                 } else {
    //                     return '400';
    //                 }
    //             } else {
    //                 return code;
    //             }
    //         } else {
    //             return code;
    //         }
    //     } else {
    //         return code;
    //     }
    // }
};

export = { retrieve };
