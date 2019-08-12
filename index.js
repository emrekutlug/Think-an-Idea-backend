/*
 Copyright 2017 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const nconf = require("nconf");
const appID = require("ibmcloud-appid");
const axios = require("axios");
const FormData = require('form-data');
const bodyParser = require("body-parser");

const helmet = require("helmet");
const express_enforces_ssl = require("express-enforces-ssl");
const cfEnv = require("cfenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");


//const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;

//?????????
const log4js = require("log4js");
const flash = require("connect-flash");
//?????????

const app = express();

let DYNAMIC_URL = '';

if (process.env.NODE_ENV === 'production') {
    DYNAMIC_URL = ''
} else {
    DYNAMIC_URL = ''
}
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    //res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Headers', 'Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
    res.header('Access-Control-Allow-Credentials', true);
    next();
};

app.use(allowCrossDomain);


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const ideaGenerationRouter = require('./ideaApi.js');
const votingRouter = require('./votingApi');
const resultsRouter = require('./resultsApi');
const usersRouter = require("./userApi");
const countdownRouter = require('./countdown.js');
const WebAppStrategy = appID.WebAppStrategy;

var port = process.env.PORT || 1234;

/*
app.use('/', (req, res, next) => {
	req.headers['Access-Control-Allow-Origin'] = '*';
	res.setHeader('Access-Control-Allow-Origin', '*');
	var accessToken = req.session[WebAppStrategy.AUTH_CONTEXT].accessToken;

	console.log(accessToken);

// get all attributes

	userAttributeManager.getAllAttributes(accessToken).then(function (attributes) {
		console.log(attributes);
		res.json(attributes);
	});



	// retrieve user info
	userAttributeManager.getUserInfo(accessToken).then(function (userInfo) {
        console.log(userInfo);
        req.user=userInfo
        next();
    });
});

*/
app.use('/idea', ideaGenerationRouter);
app.use('/voting', votingRouter);
app.use('/results', resultsRouter);
app.use('/users', usersRouter);
app.use('/countdown', countdownRouter);


const TokenManager = appID.TokenManager;
const userAttributeManager = appID.UserProfileManager;
//const userAttributeManager = appID.UserAttributeManager;
const UnauthorizedException = appID.UnauthorizedException;

//?????????????
const logger = log4js.getLogger("testApp");
app.use(flash());
app.set('view engine', 'ejs'); // set up ejs for templating
// Use static resources from /samples directory
app.use(express.static(__dirname));


//?????????????

// Below URLs will be used for App ID OAuth flows
const LOGIN_URL = "/ibm/bluemix/appid/login";
const CALLBACK_URL = "/ibm/bluemix/appid/callback";
const UI_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://thinkanidea-client.mybluemix.net' : 'http://localhost:8080';
const LOGOUT_PAGE = "https://w3id.alpha.sso.ibm.com/pkmslogout";
const SIGN_UP_URL = "/ibm/bluemix/appid/sign_up";
const CHANGE_PASSWORD_URL = "/ibm/bluemix/appid/change_password";
const CHANGE_DETAILS_URL = "/ibm/bluemix/appid/change_details";
const FORGOT_PASSWORD_URL = "/ibm/bluemix/appid/forgot_password";
const LOGIN_ANON_URL = "/ibm/bluemix/appid/loginanon";
const LOGOUT_URL = "/ibm/bluemix/appid/logout";
const ROP_LOGIN_PAGE_URL = "/ibm/bluemix/appid/rop/login";


const isLocal = cfEnv.getAppEnv().isLocal;
const config = getLocalConfig();
configureSecurity();

// Setup express application to use express-session middleware
// Must be configured with proper session storage for production
// environments. See https://github.com/expressjs/session for
// additional documentation
/*
app.use(session({
	secret: "123456",
	resave: true,
	saveUninitialized: true
}));
*/
app.use(cors({credentials: true, origin: UI_BASE_URL}));
app.use(session({
    secret: "keyboardcat",
    resave: true,
    saveUninitialized: true,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: !isLocal,
        maxAge: 600000000
    }
}));


// Configure express application to use passportjs
app.use(passport.initialize());
app.use(passport.session());

// Configure passportjs to use WebAppStrategy
/*
let webAppStrategy = new WebAppStrategy({
	tenantId: "64250625-8630-4d8b-ac17-a23556f36376",
	clientId: "ab8cbcc6-5023-435b-a5f7-f12d74f1fa30",
	secret: "MmMwNTAxMjQtODcwNi00ZGFlLWJjZTctNTFjY2JlMWI4ZjZi",
	oauthServerUrl: "https://appid-oauth.eu-de.bluemix.net/oauth/v3/64250625-8630-4d8b-ac17-a23556f36376",
	redirectUri: "http://localhost:3000" + CALLBACK_URL
});
passport.use(webAppStrategy);
*/

let webAppStrategy = new WebAppStrategy(config);
passport.use(webAppStrategy);
userAttributeManager.init(config);

// Configure passportjs with user serialization/deserialization. This is required
// for authenticated session persistence accross HTTP requests. See passportjs docs
// for additional information http://passportjs.org/docs
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});


// Protected area. If current user is not authenticated - redirect to the login widget will be returned.
// In case user is authenticated - a page with current user information will be returned.

//app.get("/auth/login", passport.authenticate(WebAppStrategy.STRATEGY_NAME, {successRedirect : UI_BASE_URL, forceLogin: true}))



async function checkUser(req, user) {
    var accessToken = req.session[WebAppStrategy.AUTH_CONTEXT].accessToken;
    console.log(accessToken);
    await userAttributeManager.getUserInfo(accessToken).then(async function (userInfo) {

        await axios({
            method: 'POST',
            //url: 'http://localhost:1234/users/addUser',
            url: '/users/addUser',
            data: {
                uid: userInfo.identities[0].idpUserInfo.attributes.uid,
                firstName: userInfo.identities[0].idpUserInfo.attributes.firstName,
                lastName: userInfo.identities[0].idpUserInfo.attributes.lastName,
                emailaddress: userInfo.identities[0].idpUserInfo.attributes.emailaddress
                }
            })
            .then(res => {
                console.log("RESPONSE:", res.data)
            })
            .catch(e => {
                console.log("ERROR:", e)
            });
    });
}

app.get('/auth/login', function (req, res, next) {
    passport.authenticate(WebAppStrategy.STRATEGY_NAME, function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.err("User Error");
        }
        req.logIn(user, async function (err) {
            if (err) {
                return next(err);
            }
            await checkUser(req);
            return res.redirect(UI_BASE_URL);
        });
    })(req, res, next);
});

// Callback to finish the authorization process. Will retrieve access and identity tokens/
// from AppID service and redirect to either (in below order)
// 1. the original URL of the request that triggered authentication, as persisted in HTTP session under WebAppStrategy.ORIGINAL_URL key.
// 2. successRedirect as specified in passport.authenticate(name, {successRedirect: "...."}) invocation
// 3. application root ("/")
//app.get(CALLBACK_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {allowAnonymousLogin: true}));
app.get(CALLBACK_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {allowAnonymousLogin: false}));


app.get("/auth/logout", function (req, res, next) {
    WebAppStrategy.logout(req);
    res.redirect(LOGOUT_PAGE);
});

app.get('/auth/logged', (req, res) => {
    req.headers['Access-Control-Allow-Origin'] = '*';
    let loggedInAs = {};
    if (req.session[WebAppStrategy.AUTH_CONTEXT]) {
        loggedInAs['name'] = req.user.name;
        loggedInAs['email'] = req.user.email;
    }

    res.send({
        logged: req.session[WebAppStrategy.AUTH_CONTEXT] ? true : false,
        loggedInAs: loggedInAs
    })
});

function isLoggedIn(req, res, next) {
    if (req.session[WebAppStrategy.AUTH_CONTEXT]) {
        next();
    } else {
        res.redirect(UI_BASE_URL);
    }
}

app.use('/*', isLoggedIn);

function getLocalConfig() {
    if (!isLocal) {
        return {};
    }
    let config = {
        "clientId": "ab8cbcc6-5023-435b-a5f7-f12d74f1fa30",
        "oauthServerUrl": "https://appid-oauth.eu-de.bluemix.net/oauth/v3/64250625-8630-4d8b-ac17-a23556f36376",
        "profilesUrl": "https://appid-profiles.eu-de.bluemix.net",
        "secret": "MmMwNTAxMjQtODcwNi00ZGFlLWJjZTctNTFjY2JlMWI4ZjZi",
        "tenantId": "64250625-8630-4d8b-ac17-a23556f36376"
    };
    /*
    const localConfig = nconf.env().file(`${__dirname}/config.json`).get();
    const requiredParams = ['clientId', 'secret', 'tenantId', 'oauthServerUrl', 'profilesUrl'];
    requiredParams.forEach(function (requiredParam) {
        if (!localConfig[requiredParam]) {
            console.error('When running locally, make sure to create a file *config.json* in the root directory. See config.template.json for an example of a configuration file.');
            console.error(`Required parameter is missing: ${requiredParam}`);
            process.exit(1);
        }
        config[requiredParam] = localConfig[requiredParam];
    });
    */

    config['redirectUri'] = `http://localhost:${port}${CALLBACK_URL}`;
    return config;
}

/*
async function getAppIdentityToken() {
	try {
		const tokenResponse = await tokenManager.getApplicationIdentityToken();
		console.log('Token response : ' + JSON.stringify(tokenResponse));

		//the token response contains the access_token, expires_in, token_type
	} catch (err) {
		console.log('err obtained : ' + err);
		res.status(500).send(err.toString());
	}
}
*/

app.get('/getAllAttributes', (req, res, next) => {
    var accessToken = req.session[WebAppStrategy.AUTH_CONTEXT].accessToken;

    // retrieve user info
    userAttributeManager.getUserInfo(accessToken).then(function (userInfo) {
        res.status(200).json({userInfo:userInfo});
    }).catch(err => console.log("ERR", err));
});


/*
// Explicit login endpoint. Will always redirect browser to login widget due to {forceLogin: true}.
// If forceLogin is set to false redirect to login widget will not occur of already authenticated users.
app.get(LOGIN_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: UI_BASE_URL,
	forceLogin: true
}));

// Explicit forgot password endpoint. Will always redirect browser to forgot password widget screen.
app.get(FORGOT_PASSWORD_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: UI_BASE_URL,
	show: WebAppStrategy.FORGOT_PASSWORD
}));

// Explicit change details endpoint. Will always redirect browser to change details widget screen.
app.get(CHANGE_DETAILS_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: UI_BASE_URL,
	show: WebAppStrategy.CHANGE_DETAILS
}));

// Explicit change password endpoint. Will always redirect browser to change password widget screen.
app.get(CHANGE_PASSWORD_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: UI_BASE_URL,
	show: WebAppStrategy.CHANGE_PASSWORD
}));

// Explicit sign up endpoint. Will always redirect browser to sign up widget screen.
// default value - false
app.get(SIGN_UP_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: UI_BASE_URL,
	show: WebAppStrategy.SIGN_UP
}));

// Explicit anonymous login endpoint. Will always redirect browser for anonymous login due to forceLogin: true
app.get(LOGIN_ANON_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: UI_BASE_URL,
	allowAnonymousLogin: true,
	allowCreateNewAnonymousUser: true
}));

// Callback to finish the authorization process. Will retrieve access and identity tokens/
// from App ID service and redirect to either (in below order)
// 1. the original URL of the request that triggered authentication, as persisted in HTTP session under WebAppStrategy.ORIGINAL_URL key.
// 2. successRedirect as specified in passport.authenticate(name, {successRedirect: "...."}) invocation
// 3. application root ("/")
app.get(CALLBACK_URL, passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// Logout endpoint. Clears authentication information from session
/*
app.get(LOGOUT_URL, function(req, res){
	WebAppStrategy.logout(req);
	res.redirect(UI_BASE_URL);
});
*/

/*

function storeRefreshTokenInCookie(req, res, next) {
	const refreshToken = req.session[WebAppStrategy.AUTH_CONTEXT].refreshToken;
	if (refreshToken) {
		res.cookie("refreshToken", refreshToken, {});
	}
	next();
}

/*
function isLoggedIn(req) {
	return req.session[WebAppStrategy.AUTH_CONTEXT];
}
*/
// Protected area. If current user is not authenticated - redirect to the login widget will be returned.
// In case user is authenticated - a page with current user information will be returned.
/*
app.get("/protected", function tryToRefreshTokenIfNotLoggedIn(req, res, next) {
	if (isLoggedIn(req)) {
		return next();
	}

	webAppStrategy.refreshTokens(req, req.cookies.refreshToken).then(next, next);
}, passport.authenticate(WebAppStrategy.STRATEGY_NAME), storeRefreshTokenInCookie, function(req, res) {
	logger.debug("/protected");
	res.json(req.user);
});
*/

/*
app.post("/rop/login/submit", bodyParser.urlencoded({extended: false}), passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
	successRedirect: UI_BASE_URL,
	failureRedirect: ROP_LOGIN_PAGE_URL,
	failureFlash : true // allow flash messages
}));

app.get(ROP_LOGIN_PAGE_URL, function(req, res) {
	// render the page and pass in any flash data if it exists
	res.render("login.ejs", { message: req.flash('error') });
});

*/


app.listen(port, function () {
    logger.info("Listening on http://localhost:" + port + "/web-app-sample.html");
});

function configureSecurity() {
    app.use(helmet());
    app.use(cookieParser());
    app.use(helmet.noCache());
    app.enable("trust proxy");
    if (!isLocal) {
        app.use(express_enforces_ssl());
    }
}


module.exports = {
    WebAppStrategy
}
