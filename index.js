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


const log4js = require("log4js");
const flash = require("connect-flash");

const app = express();

if(process.env.NODE_ENV === 'production') {
    app.use (function (req, res, next) {
        if (req.secure) {
            next();
        } else {
            res.status(301).redirect('https://' + req.headers.host + req.url);
        }
    });
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


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const ideaGenerationRouter = require('./IdeaGeneration/ideaApi.js');
const votingRouter = require('./Voting/votingApi');
const resultsRouter = require('./Result/resultsApi');
const usersRouter = require("./User/userApi");
const countdownRouter = require('./Coundown/countdown.js');
const WebAppStrategy = appID.WebAppStrategy;

var port = process.env.PORT || 1234;


app.use('/idea', ideaGenerationRouter);
app.use('/voting', votingRouter);
app.use('/results', resultsRouter);
app.use('/users', usersRouter);
app.use('/countdown', countdownRouter);


const TokenManager = appID.TokenManager;
const userAttributeManager = appID.UserProfileManager;
//const userAttributeManager = appID.UserAttributeManager;
const UnauthorizedException = appID.UnauthorizedException;

const logger = log4js.getLogger("testApp");
app.use(flash());
app.set('view engine', 'ejs'); // set up ejs for templating
// Use static resources from /samples directory
app.use(express.static(__dirname));


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
    await userAttributeManager.getUserInfo(accessToken).then(async function (userInfo) {

        await axios({
            method: 'POST',
            url: process.env.NODE_ENV === 'production' ? 'https://thinkanidea-server.mybluemix.net/users/addUser' : 'http://localhost:1234/users/addUser',
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
    //if (!isLocal) return {}
    let config = {};
    
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

    if(process.env.NODE_ENV === 'production'){
        config['redirectUri'] = `https://thinkanidea-server.mybluemix.net${CALLBACK_URL}`;
    }else{
        config['redirectUri'] = `http://localhost:${port}${CALLBACK_URL}`;
    }
    return config;
}

app.get('/getAllAttributes', (req, res, next) => {
    var accessToken = req.session[WebAppStrategy.AUTH_CONTEXT].accessToken;

    // retrieve user info
    userAttributeManager.getUserInfo(accessToken).then(function (userInfo) {
        res.status(200).json({userInfo:userInfo});
    }).catch(err => console.log("ERR", err));
});


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
