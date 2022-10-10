const fs = require('fs');
const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger_output.json';
let routesFiles = [];
const routesDir = './api/routes/';

fs.readdirSync(routesDir).forEach((file) => {
  routesFiles.push(`${routesDir}${file}`);
});

swaggerAutogen(outputFile, routesFiles);
