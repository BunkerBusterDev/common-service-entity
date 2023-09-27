import koaRouter from '@koa/router';

import mobiusCtrl from './CBControl';
import middlewares from 'core/http/middlewares';

const apiMobius = new koaRouter();
apiMobius.post('/', mobiusCtrl.getTest, middlewares.lookupCreate);
apiMobius.get('/', mobiusCtrl.getCSE, middlewares.lookupRetrieve);
apiMobius.get('/:rn', mobiusCtrl.getTest);

export = apiMobius;
