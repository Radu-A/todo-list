import React from "react";
import { shallow } from "enzyme";
import ControlSection from "./ControlSection";

describe("ControlSection", () => {
  test("matches snapshot", () => {
    const wrapper = shallow(<ControlSection />);
    expect(wrapper).toMatchSnapshot();
  });
});
