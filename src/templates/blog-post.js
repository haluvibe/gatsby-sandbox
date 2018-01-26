import React from 'react';

const arrayHead = arr => arr.length && arr[0];

export default ({ data }) => {
  const post = arrayHead(data.allPost.edges).node;
  return (
    <div>
      <h1>{post.name}</h1>
      <p>{post.content}</p>
      <img src={post.image} />
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
        }
      }
    }
  }
`;
