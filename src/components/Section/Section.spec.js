import React from 'react';
import toJson from 'enzyme-to-json';
import { shallow } from 'enzyme';
import Section from './Section';

const mockSettings = {
  id: 'id',
  className: 'a-class another-class',
  style: {
    backgroundColor: 'red',
    fontSize: 16,
  }
}

test('Section component should render as expected', () => {
  const component = shallow(<Section settings={mockSettings} children={null} />);
  const tree = toJson(component);
  expect(tree).toMatchSnapshot();
});
