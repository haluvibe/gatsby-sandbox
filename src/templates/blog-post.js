import React from 'react';
import Markdown from 'react-markdown';
import renderHTML from 'react-render-html';
import Layout from '../components/Layout/Layout';
import uuidv4 from 'uuid/v4';

const arrayHead = arr => arr.length && arr[0];

export default ({ data }) => {
  const post = arrayHead(data.allPost.edges).node;
  console.log('post.layout_parsed', post.layout_parsed);
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
      {
        post.md
          ? <Markdown 
            escapeHtml={true}
            source={post.md} 
          />
          : null
      }
      {
        post.wysiwyg 
          ? renderHTML(post.wysiwyg)
          : null
      }
      {
        post.layout_parsed
          ? post.layout_parsed.map(props => <Layout key={uuidv4()} {...props}/>)
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
          md
          wysiwyg
          layout {
            component
          }
          layout_parsed
          teaser_image {
            publicURL
          }
        }
      }
    }
  }
`;
