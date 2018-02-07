import React, { Fragment, Component } from 'react';
import Section from '../Section/Section';
import Grid from '../Grid/Grid';
import Text from '../Text/Text';

const components = {
  section: Section,
  grid: Grid,
  text: Text,
};

export default ({component, ...others}) => {
  const ComponentType = components[component];
  return ComponentType 
    ? <ComponentType {...others} />
    : <div>{`${component} doesn't exist`}</div>
};