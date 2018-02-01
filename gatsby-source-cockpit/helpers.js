const { createRemoteFileNode } = require(`gatsby-source-filesystem`);
const crypto = require('crypto');
const { singular } = require('pluralize');
const markdown = require( "markdown" ).markdown;

class CockpitHelpers {
  constructor(Cockpit, CockpitConfig) {
    this.Cockpit = Cockpit;
    this.CockpitConfig = CockpitConfig;
  }

  // get cockpit collection items by collection name
  async getCollectionItems(name) {
    const { fields, entries } = await this.Cockpit.collectionGet(name);
    return { fields, entries, name };
  }

  // get all cockpit collections, together with their items
  async getCockpitCollections() {
    const allCollections = await this.Cockpit.collectionList();
    const explictlyDefinedCollections = this.CockpitConfig.COLLECTIONS;

    //allCollections filter by config file
    const collections = explictlyDefinedCollections instanceof Array 
      ? allCollections.filter(
        name => explictlyDefinedCollections.indexOf(name) > -1)
      : allCollections;

    return Promise.all(collections.map(name => this.getCollectionItems(name)));
  }  
}

class AssetMapHelpers {
  constructor({ 
    assets, 
    store, 
    cache, 
    createNode, 
    collectionsItems, 
    CockpitConfig,
  }) {
    this.assets = assets;
    this.store = store;
    this.cache = cache; 
    this.createNode = createNode; 
    this.collectionsItems = collectionsItems;
    this.CockpitConfig = CockpitConfig;
  }

  addAllOtherImagesPathsToAssetsArray() {
    this.collectionsItems.map(({ entries, fields }) => {
      const imageFields = Object.keys(fields).filter(
        fieldname => fields[fieldname].type === 'image'
      );
      imageFields.forEach(fieldname => {
        entries.forEach(entry => {
          if (entry[fieldname].path) {
            this.assets.push({
              path: `${this.CockpitConfig.COCKPIT_BASE_URL}/${entry[fieldname].path}`,
            });
          }
        });
      });
    });
  }

  async createRemoteAssetByPath(url) {
    const { id } = await createRemoteFileNode({
      url,
      store: this.store,
      cache: this.cache,
      createNode: this.createNode,
    });
    return ({ url, id });
  }

  // gets all assets and adds them as file nodes
  // returns a map of url => node id
  async createAssetsNodes() {

    this.addAllOtherImagesPathsToAssetsArray();

    const allRemoteAssetsPromise = this.assets.map(asset => 
      this.createRemoteAssetByPath(asset.path));

    const allResults = await Promise.all(allRemoteAssetsPromise);
  
    const finalAssetsMap = allResults.reduce(
      (acc, { url, id }) => ({
        ...acc,
        [url]: id,
      }),
      {}
    );
    return finalAssetsMap;
  }
}

class CreateNodesHelpers {
  constructor({
    collectionsItems,
    store,
    cache,
    createNode,
    assetsMap,
  }) {
    this.collectionsItems = collectionsItems;
    this.store = store;
    this.cache = cache;
    this.createNode = createNode;
    this.assetsMap = assetsMap;
  }

  async createCollectionsItemsNodes() {
    Promise.all(
      this.collectionsItems.map(({ fields, entries, name }) => {
        const nodes = entries.map(entry =>
          this.createItemNode({
            entry,
            name,
            fields,
          })
        );
        return { name, nodes, fields };
      })
    );
  }

  getImageFields(fields) {
    return Object.keys(fields).filter(
      fieldname => fields[fieldname].type === 'image'
    );
  }

  getOtherFields(fields) {
    const fieldsThatRequireParsing = ['image'];
    return Object.keys(fields).filter(
      fieldname => fieldsThatRequireParsing.indexOf(fields[fieldname].type) === -1
    );
  }

  // map the entry image fields to link to the asset node
  // the important part is the `___NODE`.
  composeEntryImageFields(imageFields, entry) {
    return imageFields.reduce(
      (acc, fieldname) => {
        if (entry[fieldname].path == null) {
          return acc;
        };
  
        let fileLocation;
        Object.keys(this.assetsMap).forEach(key => {
          if (key.includes(entry[fieldname].path)) {
            fileLocation = this.assetsMap[key]
          }
        });
        const key = fieldname + '___NODE';
        const newAcc = {
          ...acc,
          [key]: fileLocation,
        };
        return newAcc;
      }, {}
    );
  }

  composeEntryWithOtherFields(otherFields, entry) {
    return otherFields.reduce(
      (acc, fieldname) => ({
        ...acc,
        [fieldname]: entry[fieldname],
      }),
      {}
    );
  }

  createItemNode({ entry, fields, name }) {
    const imageFields = this.getImageFields(fields);
    const otherFields = this.getOtherFields(fields);
    const entryImageFields = this.composeEntryImageFields(imageFields, entry);
    const entryWithOtherFields = this.composeEntryWithOtherFields(otherFields, entry);

    const node = {
      ...entryWithOtherFields,
      ...entryImageFields,
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
    this.createNode(node);
    return node;
  }
}

module.exports = {
  CockpitHelpers,
  AssetMapHelpers,
  CreateNodesHelpers,
};