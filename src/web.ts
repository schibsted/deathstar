import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { slackRoute } from './middlewares/slack';
import { lbStatusRoute } from './middlewares/lb-status';

const app = new Koa();

app.use(bodyParser());
app.use(lbStatusRoute);
app.use(slackRoute);

app.listen(3000);
