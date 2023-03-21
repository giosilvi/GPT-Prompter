const crxHotreload = require('crx-hotreload');

if (module.hot) {
  module.hot.accept();
  crxHotreload();
}
