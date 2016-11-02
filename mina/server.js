const path = require('path');

const koa = require('koa');
const router = require('koa-router')();
const staticResources = require('koa-static');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');

const config = require('./config');

const app = koa();

app.use(bodyParser());
app.use(staticResources(path.join(__dirname, '../')));

const __PROD__ = process.env.NODE_ENV === 'production';

if(__PROD__){
	//压缩处理
	
	//静态文件
}else{
	const webpack = require('webpack');
	const devconfig = require('../webpack-dev.config');
	const compiler = webpack(devconfig);

	app.use(require('koa-webpack-dev-middleware')(compiler, {
	  // noInfo: true,
	  stats: {
	    colors: true
	  },
	  publicPath: devconfig.output.publicPath
	}));

	app.use(require('koa-webpack-hot-middleware')(compiler));
	app.use(require('koa-logger')());
}

render(app, {
  root: path.join(__dirname, '../'),
  layout: false,
  viewExt: 'html',
  debug: true,
  cache: false
});

let indexHtml = __PROD__ ? `index-release` : `index-dev`;

//入口路由
router.get('/', function *() {
	yield this.render(indexHtml);
});

router.get('*', function *(){
	yield this.render(indexHtml);
});

app.use(router.routes());

app.listen(config.serverPort,config.serverHostName,function(){
	console.log('Listening at http://localhost:'+config.serverPort);
});
