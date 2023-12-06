import React from "react";
import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";

import Slider from "./Slider";
import images from "../images";

describe("test the Slider component", () => {
	test("render result", () => {
		<Slider>
			{images.map((img, index) => (
				<img src={img} alt={"no Image Found"} key={index} />
			))}
		</Slider>;
		// expect(result).toMatchSnapshot();
	});
});
