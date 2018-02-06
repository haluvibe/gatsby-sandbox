import React, { Fragment, Component } from 'react';
import Section from '../Section/Section';


class Layout extends Component {
  components = {
    section: Section,
  };
  render() {
     const ComponentType = this.components[this.props.component];
     return <ComponentType {...this.props} />
  }
}

export default Layout;