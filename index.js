const express = require('express')
const app = express()
const port = process.env.NERU_APP_PORT || 3000;
var cors = require('cors');
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const debug = process.env.DEBUG || false;
const default_source = "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8"
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('socketio', io);
app.enable('trust proxy');
var socket = null
console.log("env vars: ", process.env)
var OpenTok = require('opentok');
var sessionId = null;
var instance_full_url = process.env.ENDPOINT_URL_SCHEME + "/" + process.env.INSTANCE_SERVICE_NAME;


io.on('connection', function(socket){
  console.log('A user connected');
  var type = "application/x-mpegURL";
  socket.on('disconnect', function () {
     console.log('A user disconnected');
     
  });
});

const join = require('path').join;
//const __dirname = dirname(fileURLToPath(import.meta.url));
const views_path = __dirname + '/views/';

//load the css, js, fonts to static paths so it's easier to call in template
app.use("/videojs", express.static(join(__dirname, "node_modules/video.js/dist/")));
app.use("/jquery", express.static(join(__dirname, "node_modules/jquery/dist/")));
app.use("/videojs-hls", express.static(join(__dirname, "node_modules/videojs-contrib-hls/dist/")));
app.use("/socket.io", express.static(join(__dirname, "node_modules/socket.io/dist/")));
app.use("/css", express.static(join(__dirname, "views/css")));
app.use("/js", express.static(join(__dirname, "views/js")));


app.get('/_/health', async (req, res) => {
  res.sendStatus(200);
});

app.get('/hlsplayer', (req, res) => {
  var source = req.query.source || null;
  if(source == null){
    source = default_source
  }
  res.render(views_path + "hlsplayer.ejs", { vid_source: source})
})

app.post('/change_source', (req, res) => {
  var io = req.app.get('socketio');
  var source = req.body.source || null;
  var type = req.body.type || "application/x-mpegURL";
  if(source == null){
    res.status(400).send("Please add the source")
    return
  }
  io.emit('changesource', { source: source, type: type });
  return res.json({"message":`Changed source to ${source}`})
})

app.get('/change_source', (req, res) => {
  var io = req.app.get('socketio');
  var source = req.query.source || null;
  var type = req.query.type || "application/x-mpegURL";
  if(source == null){
    res.status(400).send("Please add the source")
    return
  }
  io.emit('changesource', { source: source, type: type });
  return res.json({"message":`Changed source to ${source}`})
})

app.post('/start_composer/:sessionId', function (req, res) {
	var apiKey = req.body.apikey || null;
	var apiSecret = req.body.secret || null;
  if(apiKey == null){
		return res.render(views_path + 'index.ejs', {message:"Parameter apikey Missing"});
  }
	if(apiSecret == null){
		return res.render(views_path + 'index.ejs', {message:"Parameter secret Missing"});
  }
	
	var opentok = new OpenTok(apiKey, apiSecret);
	var source = req.body.source || null;
  sessionId = req.params['sessionId'];
  var hlsurl = instance_full_url+"/hlsplayer"
	if(source){
		hlsurl = hlsurl+"?source="+source
	}
	token = opentok.generateToken(sessionId);
	opentok.startRender({
		sessionId: sessionId,
		token: token,
		apiKey: apiKey,
		maxDuration: 999, //auto stop in 3 minuted
		url: hlsurl
	}, (err, render)=>{
    if(!err){
      res.json(render);
    }else{
			res.json([err, hlsurl])
		}
	} );
});

app.post('/stop_composer/:renderid', function (req, res) {
	var apiKey = req.body.apikey || null;
	var apiSecret = req.body.secret || null;
  if(apiKey == null){
		return res.render(views_path + 'index.ejs', {message:"Parameter apikey Missing"});
  }
	if(apiSecret == null){
		return res.render(views_path + 'index.ejs', {message:"Parameter secret Missing"});
  }
	
	var opentok = new OpenTok(apiKey, apiSecret);
  renderId = req.params['renderid'];
	opentok.stopRender(
		renderId, (err, render)=>{
    if(!err){
      res.json(render);
    }else{
			res.json(err)
		}
	} );
});

app.get('/callback', function (req, res) {

});


app.get('/', function (req, res) {
  res.render(views_path + 'index.ejs', {message:""});
});

app.post('/demo', function (req, res) {
	var apiKey = req.body.apikey || null;
	var apiSecret = req.body.secret || null;
  if(apiKey == null){
		return res.render(views_path + 'index.ejs', {message:"Parameter apikey Missing"});
  }
	if(apiSecret == null){
		return res.render(views_path + 'index.ejs', {message:"Parameter secret Missing"});
  }
	
	var opentok = new OpenTok(apiKey, apiSecret);

  opentok.createSession({ mediaMode: 'routed' }, function (err, session) {
		console.log(err)
		if(err){
			return res.render(views_path + 'index.ejs', {message:"Invalid API Key and Secret"});
		}
		sessionId = session.sessionId;
		token = opentok.generateToken(sessionId);
		res.render(views_path + 'demo_view.ejs', {
			sessionId: sessionId,
			token: token,
			apiKey: apiKey,
			apiSecret: apiSecret,
			default_source: default_source
		});
	});
});

http.listen(port, () => {
  console.log(`listening on port: ${port}`);
});

