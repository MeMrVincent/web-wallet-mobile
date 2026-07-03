const prodCommon = require('./builder.js');

module.exports = (RESETENV) => {
  return prodCommon(RESETENV, {
    envType: 'uat',
    vConsole: true,
  });
};

