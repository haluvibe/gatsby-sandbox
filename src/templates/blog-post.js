import React from 'react';

const arrayHead = arr => arr.length && arr[0];

export default ({ data }) => {
  const post = arrayHead(data.allPost.edges).node;
  return (
    <div>
      <h1>{post.name}</h1>
      <p>{post.content}</p>
      {
        post.teaser_image 
          ? <img src={post.teaser_image.publicURL} /> 
          : null
      }
      {
        post.teaser_image 
          ? post.teaser_image.publicURL
          : null
      }
    </div>
  );
};

export const query = graphql`
  query BlogPostQuery($slug: String!) {
    allPost(filter: { slug: { eq: $slug } }) {
      edges {
        node {
          name
          content
          teaser_image {
            publicURL
          }
        }
      }
    }
  }
`;
