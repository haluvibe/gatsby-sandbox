import React from 'react';
import g from 'glamorous';
import Link from 'gatsby-link';

import { rhythm } from '../utils/typography';

export default ({ data }) => {
  return (
    <div>
      <g.H1 display={'inline-block'} borderBottom={'1px solid'}>
        Amazing Pandas Eating Things
      </g.H1>
      <h4>{data.site.siteMetadata.title} Posts</h4>

      <h3>{data.post.name}</h3>
      <h3>{data.post.id}</h3>
    </div>
  );
};

export const query = graphql`
  query IndexQuery {
    site {
      siteMetadata {
        title
      }
    }
    post {
      id
      name
    }
  }
`;
