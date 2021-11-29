const Koa = require('koa');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const app = new Koa();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 3333;

const uploads = path.join(__dirname, '/uploads');

app.use(koaBody({
    urlencoded:true,
    multipart: true,
}));

app.use(koaStatic(uploads));

let list = fs.readdirSync(uploads);

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

    if (method === 'imgList') {
        const uploadsLink = [];
        list.forEach(elem => {
            uploadsLink.push({
                url: `http://localhost:3333/uploads/${elem}`,
                name: elem,
        });
        })
        ctx.response.body = JSON.stringify(uploadsLink);
        return;
    }

    if (method === 'uploadImage') {
            // const { file } = ctx.request.files;
            console.log(ctx.request.files);
            // const link = await new Promise((resolve, reject) => {
            //   const oldPath = file.path;
            //   const filename = uuid.v4();
            //   const newPath = path.join(uploads, filename);
            //   const callback = error => reject(error);
            //   const readStream = fs.createReadStream(oldPath);
            //   const writeStream = fs.createWriteStream(newPath);
            //   readStream.on('error', callback);
            //   writeStream.on('error', callback);
            //   readStream.on('close', () => {
            //     console.log('close');
            //     fs.unlink(oldPath, callback);
            //     resolve(filename);
            //   });
            //   readStream.pipe(writeStream);
            // });
            // ctx.response.body = link;
            // list = fs.readdirSync(uploads);
            ctx.response.status = 200;
        return;
    }

    if (method === 'removeImage') {
        const name = ctx.request.query.id;
        fs.unlinkSync(`./uploads/${name}`);
        list = fs.readdirSync(uploads);
        ctx.response.status = 200;
        return
    }

    ctx.response.status = 404;
    return;
});


app.listen(port, () => console.log('Server started'));