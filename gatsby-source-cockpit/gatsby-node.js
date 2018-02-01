const CockpitSDK = require('cockpit-sdk').default;
const { AssetMapHelpers, CockpitHelpers, CreateNodesHelpers } = require('./helpers');

exports.sourceNodes = async ({
  boundActionCreators: { createNode },
  store,
  cache,
}, pluginOptions) => {
  
  const CockpitConfig = pluginOptions.cockpitConfig;
  const host = CockpitConfig.COCKPIT_BASE_URL + CockpitConfig.COCKPIT_FOLDER;
  const accessToken = CockpitConfig.ACCESS_TOKEN;

  const Cockpit = new CockpitSDK({
    host,
    accessToken,
  });

  const cockpitHelpers = new CockpitHelpers(Cockpit, CockpitConfig);

  const [{ assets }, collectionsItems] = await Promise.all([
    Cockpit.assets(), 
    cockpitHelpers.getCockpitCollections(),
  ]);

  const assetMapHelpers = new AssetMapHelpers({
    assets,
    store,
    cache,
    createNode,
    collectionsItems,
    CockpitConfig,
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
