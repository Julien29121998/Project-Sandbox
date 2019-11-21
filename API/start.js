const fs = require('fs');
const path = require('path');
const clipboardy = require('clipboardy');
const { generateCreds, runCmd, wait } = require('./utils/fn');
let username;
let password;

(async () => {

  if (fs.existsSync(path.resolve(__dirname, './utils/creds.js'))) {
    const data = require('./utils/creds');
    username = data.username;
    password = data.password;
  }

  await runCmd('docker swarm init');

  if (!fs.existsSync(path.resolve(__dirname, './faas/deploy_stack.sh'))) {
    await runCmd('git clone https://github.com/openfaas/faas');
  }

  await runCmd('sh deploy_stack.sh', { cwd: path.resolve(__dirname, 'faas') }, (line) => {
    if (line.includes('[Credentials]')) {
      const words = line.split(' ');
      for (let i = 0; i < words.length; i++) {
        if (words[i] === 'username:') {
          username = words[i + 1];
        }
        if (words[i] === 'password:') {
          password = words[i + 1].replace('\\n', '');
        }
      }
    }
  });

  if (username && password) {
    fs.writeFileSync(path.resolve(__dirname, './utils/creds.js'), generateCreds(username, password));
  }

  clipboardy.writeSync(password);

  await wait(5000);

  await runCmd(`faas-cli login --username=${username} --password=${password}`);

  console.info(`Dashboard available here: http://localhost:8080/ui/`);
  console.info(`Username: ${username}\nPassword: ${password}`);
  console.info('\nPassword has been copied to clipboard.');
  clipboardy.writeSync(password);
})();
