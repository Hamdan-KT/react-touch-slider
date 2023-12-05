import React, { useRef } from 'react'

export default function Slide({ child, sliderWidth, sliderHeight, scaleEffect = false }) {
	const slideRef = useRef();
	const pointerDown = () => {
		if (scaleEffect && slideRef.current)
			slideRef.current.style.transform = "scale(0.95)";
	};

	const pointerUp = () => {
		if (scaleEffect && slideRef.current)
			slideRef.current.style.transform = "scale(1)";
	};

  return (
		<div
			ref={slideRef}
			style={{
				width: `${sliderWidth}px`,
				height: `${sliderHeight}px`,
				transition: "transform 0.3s ease-out",
			}}
		>
			<div
				style={{
					padding: "0.3rem",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					userSelect: "none",
				}}
				onPointerDown={pointerDown}
				onPointerUp={pointerUp}
				onPointerLeave={pointerUp}
				onDragStart={(e) => {
					e.preventDefault();
					e.stopPropagation();
					return false;
				}}
			>
				{child}
			</div>
		</div>
	);
}
