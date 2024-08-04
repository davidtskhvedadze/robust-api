const app = require('./src/app');
const config = require('./src/utils/config');
const logger = require('./src/utils/logger');

app.listen(config.PORT, () => {
  logger.info(`Server is running on http://localhost:${config.PORT}`);
});