import r from 'koa-route';
import { Context } from 'koa';

export const lbStatusRoute = r.get('/lb-status', async (ctx: Context) => {
  ctx.body = {};
  ctx.status = 200;
});
