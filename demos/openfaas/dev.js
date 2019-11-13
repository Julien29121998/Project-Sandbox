const fs = require('fs');
const path = require('path');

const { deploy } = require('./utils/fn');

let start = new Date();
let ttl = 1000;

(async () => {
  fs.watch(path.resolve(__dirname, './functions'), { recursive: true }, async (event, filename) => {
    if ((new Date() - start) > ttl) {
      const folders = filename.split(path.sep);
      if (folders.length > 2) {
        const lang = folders[0];
        const func = folders[1];
        const yml = `./functions/${lang}/${func}/${func}.yml`;
        await deploy(yml);
      }
    }
    start = new Date();
  });
})();
