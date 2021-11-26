const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();
const { v4: uuidv4 } = require('uuid');
const port = process.env.PORT || 3333;

app.use(koaBody({ urlencoded:true, }));

app.use(async (ctx, next) => {
    const origin = ctx.request.get('Origin');
    if (!origin) {
        return await next();
    }
    const headers = {'Access-Control-Allow-Origin':'*',};
    if (ctx.request.method!=='OPTIONS') {
        ctx.response.set({...headers});
        try {
            return await next();
        } catch (e) {
            e.headers = {...e.headers, ...headers};
            throw e;
        }
    }
    if (ctx.request.get('Access-Control-Request-Method')) {
        ctx.response.set({...headers,'Access-Control-Allow-Methods':'GET, POST, PUT, DELETE, PATCH',});
        if (ctx.request.get('Access-Control-Request-Headers')) {
            ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Allow-Request-Headers'));
        }
        ctx.response.status = 204;// No content
    }
});

app.use(async ctx => {
    const method = ctx.request.query.method;
    console.log(method); 
    if (method === 'uploadImage') {
        console.log(ctx.request.body);
    }
    ctx.response.body = 'hi';
    // const ticket = JSON.parse(ctx.request.body);

    // ctx.response.status = 404;
    return;
});


app.listen(port, () => console.log('Server started'));