const mongoose = require('mongoose');

// mongoose.set('debug', true);

const DB_URL = process.env.DB_URL || 'mongodb://localhost/sampleDB';

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

module.exports = {
    User: require('./users'),
    Community: require('./communities'),
    Post: require('./posts'),
};
