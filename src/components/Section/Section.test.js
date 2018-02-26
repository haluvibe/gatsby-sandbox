import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import Section from './Section';
import { mockSettings } from '../../utils/testHelpers';

test('Section component should render as expected', () => {
  const component = shallow(<Section settings={mockSettings} children={null} />);
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();
});
