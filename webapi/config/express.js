// API baseada no tutorial https://medium.com/xp-inc/https-medium-com-tiago-jlima-developer-criando-uma-api-restful-com-nodejs-e-express-9cc1a2c9d4d8

const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('config');

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger_output.json');

module.exports = () => {
    const app = express();

    // Setando variáveis da aplicação
    app.set('port', config.get('server.port'));

    // Middlewares
    app.use(bodyParser.json());
    app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

    app.use(cors())
    
    const routesDir = './api/routes/';

    fs.readdirSync(routesDir).forEach((file) => {
        require(`../api/routes/${file.replace('.js', '')}`)(app);
    });


    return app;
};