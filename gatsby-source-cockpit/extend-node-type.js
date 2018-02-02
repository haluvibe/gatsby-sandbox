const GraphQLJSON = require('graphql-type-json');

module.exports = async (
  { type, store, pathPrefix, getNode, cache },
  pluginOptions
) => {

  if (type.name !== `Post`) {
    return {};
  }

  return {
    layout_full: {
      type: GraphQLJSON,
      resolve(Post) {
        return Post.layout;
      },
    },
  };
};