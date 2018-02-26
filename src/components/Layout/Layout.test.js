import React from "react";
import toJson from "enzyme-to-json";
import { shallow } from "enzyme";

import Layout from "./Layout";

test("Layout component should render as expected", () => {
    const component = shallow(<Layout />),
        tree = toJson(component);
    expect(tree).toMatchSnapshot();
});
