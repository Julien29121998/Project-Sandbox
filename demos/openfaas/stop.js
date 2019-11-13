const { runCmd } = require('./utils/fn');

(async () => {
  await runCmd('docker service ls --filter="label=function" -q | xargs docker service rm');
  await runCmd('docker stack rm func && docker secret rm basic-auth-user && docker secret rm basic-auth-password');
  await runCmd('docker swarm leave --force');
})();
