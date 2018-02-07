const GraphQLJSON = require('graphql-type-json');
const gatsbyNode = require('./gatsby-node');
const { singular } = require('pluralize');
const styler = require('react-styling');
const HtmlToReactParser = require('html-to-react').Parser;
const htmlToReactParser = new HtmlToReactParser();


module.exports = async (
  { type, store, pathPrefix, getNode, cache },
  pluginOptions
) => {
  const { collectionsItems, collectionsNames } = gatsbyNode;
  const singularCollectionNames = collectionsNames.map(name => singular(name));

  if (singularCollectionNames.indexOf(type.name) === -1) {
    return {};
  }

  const parseLayout = (layout) => {
    if (layout == null || layout.length === 0) {
      return layout;
    }
    const parsedLayout = layout.map(node => {
      if ('settings' in node) {
        node.settings = parseSettings(node.settings);
      }
      Object.entries(node).forEach(([key, value]) => {
        if (value instanceof Array) {
          parseLayout(node[key]);
        }
        if (value instanceof Object && 'settings' in node[key]) {
          node[key].settings = parseSettings(node.settings);
        }
      });
      return node;
    });
    return parsedLayout;
  }

  const parseSettings = (settings) => {
    if (settings.text === '' || settings.text == null) {
      settings.text = null;
    } else {
      settings.textReact = htmlToReactParser.parse(settings.text);
    }
    if (settings.id === '') {
      settings.id = null;
    }
    if (settings.class === '') {
      settings.className = settings.class;
    } else {
      settings.className = null;
    }
    delete settings.class;
    
    if (settings.style === '' || settings.style == null) {
      settings.style = null;
    } else {
      settings.style = styler(settings.style);
    }
    return settings;
  };

  let nodeExtendType = {};
  collectionsItems.map(({entries, fields, name}) => {
    if (type.name !== singular(name)) {
      return;
    }

    const jsonFields = Object.keys(fields).filter(
      fieldname => fields[fieldname].type === 'layout'
    );

    jsonFields.forEach(fieldname => {
      nodeExtendType[`${fieldname}_parsed`] = {
        type: GraphQLJSON,
        resolve(Item) {
          const parsedLayout = parseLayout(Item[`${fieldname}`]);
          console.log('parsedLayout', JSON.stringify(parsedLayout));
          return parsedLayout;
        },
      };
    });
  });

  return nodeExtendType;
};