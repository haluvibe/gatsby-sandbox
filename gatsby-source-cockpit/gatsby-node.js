const crypto = require('crypto');
const CockpitSDK = require('cockpit-sdk').default;
const { singular } = require('pluralize');
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

const COCKPIT_BASE = 'http://localhost:8888/cockpit';
const COCKPIT_IMAGES_BASE = 'http://localhost:8888';
const ACCESS_TOKEN = '4d659efb084077fd24aeb4871d4386';

const Cockpit = new CockpitSDK({
  host: COCKPIT_BASE, // e.g. local docker Cockpit.
  accessToken: ACCESS_TOKEN,
});

// get cockpit collection items by collection name
const getCollectionItems = async name => {
  const { fields, entries } = await Cockpit.collectionGet(name);
  return { fields, entries, name };
};

// get all cockpit collections, together with their items
const getCockpitCollections = async () => {
  const allCollections = await Cockpit.collectionList();
  return Promise.all(allCollections.map(getCollectionItems));
};

// gets all assets and adds them as file nodes
// returns a map of url => node id
const createAssetsNodes = async ({ assets, store, cache, createNode, collectionsItems }) => {
  const { entries, fields } = collectionsItems;
  const createRemoteAssetByPath = url =>
    createRemoteFileNode({
      url,
      store,
      cache,
      createNode,
    }).then(({ id }) => ({ url, id }));

  collectionsItems.map(({ entries, fields }) => {
    const imageFields = Object.keys(fields).filter(
      fieldname => fields[fieldname].type === 'image'
    );

    imageFields.forEach(fieldname => {
      entries.forEach(entry => {
        if (entry[fieldname].path) {
          assets.push({ 
            path: `${COCKPIT_IMAGES_BASE}/${entry[fieldname].path}`,
          });
        }
      });
    });
  });

  const allRemoteAssetsPromise = assets.map(asset => createRemoteAssetByPath(asset.path));

  const allResults = await Promise.all(allRemoteAssetsPromise);

  const finalAssetsMap = allResults.reduce(
    (acc, { url, id }) => ({
      ...acc,
      [url]: id,
    }),
    {}
  );
  return finalAssetsMap;
};

const createItemNode = ({ entry, fields, name, assetsMap, createNode }) => {
  const imageFields = Object.keys(fields).filter(
    fieldname => fields[fieldname].type === 'image'
  );
  const nonImageFields = Object.keys(fields).filter(
    fieldname => fields[fieldname].type !== 'image'
  );

  // remove image fields from entry (they will be added as a link)
  const entryWithoutImageFields = nonImageFields.reduce(
    (acc, fieldname) => ({
      ...acc,
      [fieldname]: entry[fieldname],
    }),
    {}
  );
  // map the entry image fields to link to the asset node
  // the important part is the `___NODE`.
  const entryImageFieldsOnly = imageFields.reduce(
    (acc, fieldname) => {
      let fileLocation;
      if (entry[fieldname].path == null) return acc;
      Object.keys(assetsMap).forEach(key => {
        if (key.includes(entry[fieldname].path)) {
          fileLocation = assetsMap[key]
        }
      })
      const key = fieldname + '___NODE';
      const newAcc = {
        ...acc,
        [key]: fileLocation
      }
      return newAcc;
    }, {}
  );

  const node = {
    ...entryWithoutImageFields,
    ...entryImageFieldsOnly,
    id: entry._id,
    children: [],
    parent: null,
    internal: {
      type: singular(name),
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(entry))
        .digest(`hex`),
    },
  };
  createNode(node);
  console.log('node', node);
  return node;
};

const createCollectionsItemsNodes = async ({
  collectionsItems,
  createNode,
  assetsMap,
}) =>
  Promise.all(
    collectionsItems.map(({ fields, entries, name }) => {
      console.log('fields', fields);
      console.log('entries', entries);
      const nodes = entries.map(entry =>
        createItemNode({
          entry,
          name,
          fields,
          assetsMap,
          createNode,
        })
      );

      return { name, nodes, fields };
    })
  );

exports.sourceNodes = async ({
  boundActionCreators: { createNode },
  store,
  cache,
}) => {
  const [{ assets }, collectionsItems] = await Promise.all([
    Cockpit.assets(), 
    getCockpitCollections(),
  ]);

  const assetsMap = await createAssetsNodes({
    assets,
    store,
    cache,
    createNode,
    collectionsItems,
  });

  // create collections items and link them with the assets nodes
  await createCollectionsItemsNodes({
    collectionsItems,
    store,
    cache,
    createNode,
    assetsMap,
  });
};
