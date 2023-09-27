import koa from 'koa';

import lookupModel from 'database/models/lookup';
// import transactionModel from 'database/models/transaction';

// const transactionLifeTimeValue = {
//     BLOCK_ALL: '1',
//     ALLOW_RETRIEVES: '2',
// };

// const transactionStateValue = {
//     INITIAL: '1',
//     LOCKED: '2',
//     EXECUTED: '3',
//     COMMITTED: '4',
//     ERROR: '5',
//     ABORTED: '6',
// };

const check = async (request: koa.DefaultContext) => {
    const logger = global.getLogger();
    const logCategory = global.getLogCategory('transaction', 'check');
    const pi = request.targetObject[Object.keys(request.targetObject)[0]].ri;

    // let state = transactionStateValue.COMMITTED;

    try {
        const resultLookup = await lookupModel.find({ pi: pi, ty: '39' });
        if (resultLookup.length === 0) {
            const info = `no parentID: ${pi}`;
            logger.info(logCategory + info);
            return 200;
        } else {
            //     const resultTransaction = await transactionModel.find({ ri: resultLookup[0].ri });
            //     for (let i = 0; i < resultTransaction.length; i++) {
            //         if (request.query.transactionID == resultTransaction[i].transactionID) {
            //             return '200';
            //         }
            //         if ('transactionLifeTime' in resultTransaction[i]) {
            //             if (resultTransaction[i].transactionLifeTime == transactionLifeTimeValue.BLOCK_ALL) {
            //                 if ('transactionState' in resultTransaction[i]) {
            //                     if (
            //                         resultTransaction[i].transactionState !== transactionStateValue.COMMITTED &&
            //                         resultTransaction[i].transactionState !== transactionStateValue.ABORTED
            //                     ) {
            //                         state = resultTransaction[i].transactionState;
            //                         break;
            //                     }
            //                 }
            //             } else if (resultTransaction[i].transactionLifeTime == transactionLifeTimeValue.ALLOW_RETRIEVES) {
            //                 if (request.method === 'GET') {
            //                     state = transactionStateValue.COMMITTED;
            //                     break;
            //                 } else {
            //                     if ('transactionLifeTime' in resultTransaction[i]) {
            //                         if (
            //                             resultTransaction[i].transactionLifeTime != transactionStateValue.COMMITTED &&
            //                             resultTransaction[i].transactionLifeTime != transactionStateValue.ABORTED
            //                         ) {
            //                             state = resultTransaction[i].transactionLifeTime;
            //                             break;
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //     }
            //     if (state === transactionStateValue.COMMITTED || state === transactionStateValue.ABORTED) {
            //         return '200';
            //     } else {
            //         return '423-1';
            //     }
        }
        return 200;
    } catch (error) {
        return 200;
    }
};

export = { check };
