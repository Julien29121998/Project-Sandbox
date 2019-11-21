const { deployAll } = require('./utils/fn');

(async () => {
  const results = await deployAll();
  for (const result of results) {
    console.info(`Function (${result.duration}ms): ${result.funcPath}\n${result.res}\n`);
  }
})();
