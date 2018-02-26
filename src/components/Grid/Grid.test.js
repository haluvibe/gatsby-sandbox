import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import Grid from './Grid';
import { mockSettings } from '../../utils/testHelpers';

test('Grid component should render as expected', () => {
  const component = shallow(<Grid settings={mockSettings} />);
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();
});
