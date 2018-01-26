const path = require(`path`);
const crypto = require('crypto');
const CockpitSDK = require('cockpit-sdk').default;
const { createFilePath } = require(`gatsby-source-filesystem`);

const Cockpit = new CockpitSDK({
  host: 'http://localhost:8888/cockpit', // e.g. local docker Cockpit.
  accessToken: '4d659efb084077fd24aeb4871d4386',
});

exports.sourceNodes = async ({ boundActionCreators }) => {
  const { createNode } = boundActionCreators;
  const posts = await Cockpit.collectionGet('Post', { limit: 3 });
  posts.entries.forEach(({ _id, name, slug, content }) => {
    createNode({
      name,
      slug,
      content,
      id: _id,
      parent: null, // or null if it's a source node without a parent
      children: [],
      internal: {
        type: `post`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(posts))
          .digest(`hex`),
      },
    });
  });
  return;
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
