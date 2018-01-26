const path = require(`path`);
const crypto = require('crypto');
const CockpitSDK = require('cockpit-sdk').default;
const { singular } = require('pluralize');
const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

const COCKPIT_BASE = 'http://localhost:8888/cockpit';
const COCKPIT_ASSETS_BASE = `${COCKPIT_BASE}/storage/uploads`;
const ACCESS_TOKEN = '4d659efb084077fd24aeb4871d4386';

const Cockpit = new CockpitSDK({
  host: COCKPIT_BASE, // e.g. local docker Cockpit.
  accessToken: ACCESS_TOKEN,
});

Cockpit.assets().then(assets => console.log(assets));

// get cockpit collection items by collection name
const getCollectionItems = async name => {
  const { fields, entries } = await Cockpit.collectionGet(name);
  return { fields, entries, name };
};

// get all cockpit collections, together with their items
const getCockpitCollections = async () => {
  // const allCollections = await Cockpit.collectionGet('listCollections');
  const allCollections = ['Post'];
  return Promise.all(allCollections.map(getCollectionItems));
};

// gets all assets and adds them as file nodes
// returns a map of url => node id
const createAssetsNodes = async ({ assets, store, cache, createNode }) => {
  const createRemoteAssetByPath = url =>
    createRemoteFileNode({
      url,
      store,
      cache,
      createNode,
    }).then(({ id }) => ({ url, id }));

  const allRemoveAssetsPromise = assets.map(asset =>
    createRemoteAssetByPath(COCKPIT_ASSETS_BASE + asset.path)
  );

  const allResults = await Promise.all(allRemoveAssetsPromise);

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
    (acc, fieldname) => ({
      ...acc,
      [`${fieldname}___NODE`]: assetsMap[
        `${COCKPIT_BASE}${entry[fieldname].path}`
      ],
    }),
    {}
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
  return node;
};

const createCollectionsItemsNodes = async ({
  collectionsItems,
  createNode,
  assetsMap,
}) =>
  Promise.all(
    collectionsItems.map(({ fields, entries, name }) => {
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
  const { assets } = await Cockpit.assets();

  // create assets fetch collection items nodes in paralel
  const [assetsMap, collectionsItems] = await Promise.all([
    createAssetsNodes({
      assets,
      store,
      cache,
      createNode,
    }),
    getCockpitCollections(),
  ]);

  // create collections items and link them with the assets nodes
  await createCollectionsItemsNodes({
    collectionsItems,
    store,
    cache,
    createNode,
    assetsMap,
  });
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;
  graphql(`
    {
      allPost {
        edges {
          node {
            slug
          }
        }
      }
    }
  `).then(result => {
    JSON.stringify(result);
    result.data.allPost.edges.map(({ node }) => node).map(post =>
      createPage({
        path: `/${post.slug}`,
        component: path.resolve('./src/templates/blog-post.js'),
        // In your member template's graphql query, you can use slug
        // as a GraphQL variable to query for data.
        context: {
          slug: post.slug,
        },
      })
    );
  });
};
