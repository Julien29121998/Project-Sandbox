const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function runCmd (command, options = {}, func) {
  return new Promise((resolve, reject) => {
    const _a = command.split(' ')[0];
    let _b = command.split(' ');
    _b.splice(0, 1);
    const cmd = spawn(_a, _b, options);
    cmd.stdout.on('data', (data) => {
      console.info(data.toString());
      if (func) {
        func(data.toString());
      }
    });
    cmd.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    cmd.on('error', (err) => {
      reject(err);
    });
    cmd.on('exit', () => {
      resolve();
    });
  });
}

async function deploy (funcPath) {
  let url;
  await runCmd(`faas-cli build -f ${funcPath}`);
  await runCmd(`faas-cli deploy -f ${funcPath}`, {}, (line) => {
    if (line.includes('URL:')) {
      const words = line.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (words[i].includes('URL:')) {
          url = words[i + 1].replace(/\\n/g, '')
        }
      }
    }
  });
  const start = new Date();
  const res = await invoke(url);
  return { funcPath: funcPath, res: res, duration: new Date() - start };
}

async function remove (funcPath) {
  let result = "";
  await runCmd(`faas-cli remove -f ${funcPath}`, {}, (line) => {
      result += line + '\n';
  });
  return result;
}

async function deployAll () {
  const funcPaths = [];
  const res = [];
  const folders = fs.readdirSync(path.resolve(__dirname, '../functions'));
  for (const folder of folders) {
    const funcs = fs.readdirSync(path.resolve(__dirname, `../functions/${folder}`));
    for (const func of funcs) {
      funcPaths.push(`./functions/${folder}/${func}/${func}.yml`);
    }
  }
  for (const funcPath of funcPaths) {
    res.push(await deploy(funcPath));
  }
  return res;
}

async function invoke (url) {
  return new Promise((resolve, reject) => {
    http.get(url, (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
      data += chunk;
    });
    resp.on('end', () => {
      resolve(data);
    });
    }).on('error', (err) => {
      reject(err);
    });
  });
}


function generateCreds (username, password) {
  return `
  (function (root, factory) {
    if (typeof exports === 'object') {
      module.exports = factory();
    } else {
      root.creds = factory();
    }
  }(this, function() {
    return {
      "username": "${username}",
      "password": "${password}"
    };
  }));
  `; 
}

module.exports = {
  deploy: deploy,
  deployAll: deployAll,
  invoke: invoke,
  generateCreds: generateCreds,
  remove: remove
  
}
