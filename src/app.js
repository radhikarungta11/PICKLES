const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const serviceRouter = require('./routers/services');
const apiRouter = require('./routers/api');

const app = express();

// const redis = require('redis');
// const RedisStore = require('connect-redis')(session);
// const redisClient = redis.createClient();
// redisClient.on('error', console.error);

const STORE_URL = process.env.STORE_URL || 'mongodb://localhost/sampleStore';
const STORE_SECRET = process.env.STORE_SECRET || 'sampleSecret';

app.use(
    session({
        // store: new RedisStore({ client: redisClient }),
        store: MongoStore.create({ mongoUrl: STORE_URL }),
        resave: false,
        saveUninitialized: false,
        secret: STORE_SECRET,
    })
);

app.set('view engine', 'hbs');
app.set('views', './src/views');

app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static('./src/public'));
app.use('/assets', express.static('./assets'));
app.use('/uploads', express.static('./uploads'));

app.use(serviceRouter);
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
    res.sendStatus(500);
    console.error(err);
});

module.exports = app;
