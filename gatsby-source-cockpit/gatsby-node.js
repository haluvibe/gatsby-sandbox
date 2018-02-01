const CockpitSDK = require('cockpit-sdk').default;
const { AssetMapHelpers, CockpitHelpers, CreateNodesHelpers } = require('./helpers');

exports.sourceNodes = async ({
  boundActionCreators: { createNode },
  store,
  cache,
}, pluginOptions) => {
  
  const config = pluginOptions.cockpitConfig;
  const host = config.baseURL + config.folder;

  const cockpit = new CockpitSDK({
    host,
    accessToken: config.accessToken,
  });

  const cockpitHelpers = new CockpitHelpers(cockpit, config);

  const [{ assets }, collectionsItems] = await Promise.all([
    cockpit.assets(), 
    cockpitHelpers.getCockpitCollections(),
  ]);

  const assetMapHelpers = new AssetMapHelpers({
    assets,
    store,
    cache,
    createNode,
    collectionsItems,
    config,
  });

  const assetsMap = await assetMapHelpers.createAssetsNodes();

  const createNodesHelpers = new CreateNodesHelpers({
    collectionsItems,
    store,
    cache,
    createNode,
    assetsMap,
  });

  await createNodesHelpers.createCollectionsItemsNodes();
};
