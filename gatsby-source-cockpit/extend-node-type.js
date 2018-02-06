const GraphQLJSON = require('graphql-type-json');
const gatsbyNode = require('./gatsby-node');
const { singular } = require('pluralize');

module.exports = async (
  { type, store, pathPrefix, getNode, cache },
  pluginOptions
) => {
  const { collectionsItems, collectionsNames } = gatsbyNode;
  const singularCollectionNames = collectionsNames.map(name => singular(name));
  let nodeExtendType = {};

  if (singularCollectionNames.indexOf(type.name) === -1) {
    return {};
  }

  collectionsItems.map(({entries, fields, name}) => {
    if (type.name !== singular(name)) {
      return;
    }

    const jsonFields = Object.keys(fields).filter(
      fieldname => fields[fieldname].type === 'layout'
    );

    jsonFields.forEach(fieldname => {
      nodeExtendType[`${fieldname}_full`] = {
        type: GraphQLJSON,
        resolve(Item) {
          return Item[`${fieldname}`];
        },
      };
    });
  });

  return nodeExtendType;
};