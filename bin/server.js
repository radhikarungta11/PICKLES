require('../src/models');

const mongoose = require('mongoose');

mongoose.connection
    .on('connected', async () => {
        console.log('Database connected');

        const app = require('../src/app');

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => console.log(`Server started at port ${PORT}`));
    })
    .on('disconnect', () => console.log('Database disconnected'))
    .on('error', console.error);
