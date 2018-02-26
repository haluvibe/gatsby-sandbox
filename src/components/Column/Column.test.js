import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import Column from './Column';
import { mockSettings } from '../../utils/testHelpers';

test('Column component should render as expected', () => {
  const component = shallow(<Column settings={mockSettings} />);
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();
});
