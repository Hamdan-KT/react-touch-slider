import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Slide from './Slide'
import { getElementDiamensions } from '../utils';

const btnStyle = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	position: "absolute",
	backgroundColor: "rgba(142, 138, 137, 0.594)",
	top: "50%",
	transform: "translateY(-50%)",
	borderRadius: "50%",
	width: "1.8rem",
	height: "1.8rem",
	cursor: "pointer",
};

export default function Slider({
	children,
	onSlideStart,
	onSlideComplete,
	onSliding,
	keyEvent = false,
	controllButton = false,
	activeIndex = null,
	threshHold = 100,
	transition = 0.3,
	scaleEffect = false,
	autoSlideTimeInterval = 3000,
	autoSliding = false,
	disableDefaultPadding = false,
	style = {}
}) {
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
	const sliderRef = useRef();
	// function constants
	const isDragging = useRef(false);
	const startingPos = useRef(0);
	const currentIndex = useRef(0);
	const previousTranslate = useRef(0);
	const currentTranslate = useRef(0);
	const animationID = useRef(null);

	// setting slider position based on index
	const setSliderPositionByIndex = useCallback(
		(width = dimensions.width) => {
			currentTranslate.current = currentIndex.current * -width;
			previousTranslate.current = currentTranslate.current;
			setSliderPosition();
		},
		[dimensions.width]
	);

	// transform animation function to create slide effect
	function setSliderPosition() {
		if (!sliderRef.current) return;
		sliderRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
	}

	// animation frame function
	function animation() {
		setSliderPosition();
		if (isDragging.current) {
			requestAnimationFrame(animation);
		}
	}

	// manually enable transition
	const enableTransition = useCallback(() => {
		if (!sliderRef.current) return;
		sliderRef.current.style.transition = `transform ${transition}s ease-out`;
	}, [transition]);

	// manually closing transition
	function disableTransition() {
		if (sliderRef.current) sliderRef.current.style.transition = `none`;
	}

	// initial set up of slider before printing dom
	useLayoutEffect(() => {
		if (sliderRef.current) {
			// disable animation on startingIndex
			disableTransition();
			// set width after first render
			setDimensions(getElementDiamensions(sliderRef.current));
			// set slider position on startIndex
			setSliderPosition(getElementDiamensions(sliderRef.current).width);
		}
	}, []);

	// check changes in activeIndex prop value
	useEffect(() => {
		if (activeIndex !== currentIndex.current) {
			enableTransition();
			currentIndex.current = activeIndex;
			setSliderPositionByIndex();
		}
	}, [activeIndex, setSliderPositionByIndex, enableTransition]);

	// handle auto slide
	useEffect(() => {
		let interval;

		if (autoSliding) {
			interval = setInterval(() => {
				enableTransition();
				if (currentIndex.current === children.length - 1) {
					currentIndex.current = 0;
				} else {
					currentIndex.current += 1;
				}
				// set slider position by index
				setSliderPositionByIndex();
			}, autoSlideTimeInterval);
		}
		// clearn up function
		return () => clearInterval(interval);
	}, [
		autoSlideTimeInterval,
		enableTransition,
		setSliderPositionByIndex,
		autoSliding,
		children.length,
	]);

	// window resize listener
	useEffect(() => {
		// function to resize based on window
		function handleResize() {
			if (sliderRef.current) {
				// disable transition on resize
				disableTransition();
				// setting dimensions based on window resize
				const { width, height } = getElementDiamensions(sliderRef.current);
				setDimensions({ width, height });
				setSliderPositionByIndex();
			}
		}

		// function handle arrow key event
		const handleKeyDown = (event) => {
			if (keyEvent) {
				const arrowsPressed = ["ArrowRight", "ArrowLeft"].includes(event.key);
				if (arrowsPressed) enableTransition();
				onSlideStart && onSlideStart(event, currentIndex.current);
				if (
					event.key === "ArrowRight" &&
					currentIndex.current < children.length - 1
				) {
					currentIndex.current += 1;
				}
				if (event.key === "ArrowLeft" && currentIndex.current > 0) {
					currentIndex.current -= 1;
				}
				onSlideComplete && onSlideComplete(event, currentIndex.current);
				setSliderPositionByIndex();
			}
		};

		window.addEventListener("resize", handleResize);
		keyEvent && window.addEventListener("keydown", handleKeyDown);
		// clean up function listener
		return () => {
			window.removeEventListener("resize", handleResize);
			keyEvent && window.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		setSliderPositionByIndex,
		keyEvent,
		enableTransition,
		onSlideComplete,
		onSlideStart,
		children.length,
	]);

	// pointer start function
	function pointerStart(index) {
		return function (event) {
			// enable transition
			enableTransition();
			// intitial contants
			startingPos.current = event.pageX;
			currentIndex.current = index;
			isDragging.current = true;
			// setting animation id
			animationID.current = requestAnimationFrame(animation);
			// set grabbin style to slider
			if (sliderRef.current) sliderRef.current.style.cursor = "grabbing";
			onSlideStart && onSlideStart(event, index);
		};
	}
	// pointer move function
	function pointerMove(event) {
		if (isDragging.current) {
			const currentPosition = event.pageX;
			currentTranslate.current =
				previousTranslate.current + currentPosition - startingPos.current;
			// eg:
			// if prevTranslate = 300, startingPos = 10, currentPosition = 40
			// currentTranslate will be = 300 + 40 - 10
			// 40 - 10 = 30
			// 300 + 30 = 330
			onSliding && onSliding(event, currentIndex.current);
		}
	}
	// pointer end function
	function pointerEnd(event) {
		enableTransition();
		cancelAnimationFrame(animationID.current);
		isDragging.current = false;
		// get moved value
		const movedDist = currentTranslate.current - previousTranslate.current;
		// eg: if currentTranslate = 330 prevTranslate = 300
		// moveDist = 330 - 300 = 30

		// snap slide based on movedDist to (next)
		if (movedDist < -threshHold && currentIndex.current < children?.length - 1)
			currentIndex.current += 1;
		// snap slide based on movedDist to (prev)
		if (movedDist > threshHold && currentIndex.current > 0)
			currentIndex.current -= 1;

		enableTransition();
		// set slider position by index
		setSliderPositionByIndex();
		// change style to grab
		sliderRef.current.style.cursor = "grab";
		onSlideComplete && onSlideComplete(event, currentIndex.current);
	}

	function handleClick(dir) {
		if (controllButton) {
			enableTransition();
			if (dir === "right" && currentIndex.current < children.length - 1) {
				currentIndex.current += 1;
			}
			if (dir === "left" && currentIndex.current > 0) {
				currentIndex.current -= 1;
			}
			setSliderPositionByIndex();
		}
	}

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				overflow: "hidden",
				maxHeight: "100vh",
				position: "relative",
				...style,
			}}
		>
			{/* slider section */}
			<div
				data-testid="slider"
				ref={sliderRef}
				style={{
					all: "initial",
					width: "100%",
					height: "100%",
					maxHeight: "100vh",
					display: "inline-flex",
					willChange: "transform, scale",
					cursor: "grab",
				}}
			>
				{children?.map((child, ind) => (
					<div
						key={ind}
						onPointerDown={pointerStart(ind)}
						onPointerMove={pointerMove}
						onPointerUp={pointerEnd}
						onPointerLeave={() => {
							if (isDragging.current) pointerEnd();
						}}
						onContextMenu={(e) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						style={{ touchAction: "none", userSelect: "none" }}
					>
						<Slide
							disableDefaultPadding={disableDefaultPadding}
							child={child}
							sliderWidth={dimensions.width}
							sliderHeight={dimensions.height}
							scaleEffect={scaleEffect}
						/>
					</div>
				))}
			</div>
			{/* action buttons */}
			{controllButton && (
				<>
					<div
						className="btn0-slider0-left"
						onClick={() => handleClick("left")}
						style={{
							...btnStyle,
							// width: dimensions.width / 23,
							// height: dimensions.width / 23,
							left: 0,
							marginLeft: "0.2rem",
						}}
					>
						<svg
							width="auto"
							height="auto"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M14.2893 5.70708C13.8988 5.31655 13.2657 5.31655 12.8751 5.70708L7.98768 10.5993C7.20729 11.3805 7.2076 12.6463 7.98837 13.427L12.8787 18.3174C13.2693 18.7079 13.9024 18.7079 14.293 18.3174C14.6835 17.9269 14.6835 17.2937 14.293 16.9032L10.1073 12.7175C9.71678 12.327 9.71678 11.6939 10.1073 11.3033L14.2893 7.12129C14.6799 6.73077 14.6799 6.0976 14.2893 5.70708Z"
								fill="#0F0F0F"
							/>
						</svg>
					</div>
					<div
						className="btn0-slider0-right"
						onClick={() => handleClick("right")}
						style={{
							...btnStyle,
							// width: dimensions.width / 23,
							// height: dimensions.width / 23,
							right: 0,
							marginRight: "0.2rem",
						}}
					>
						<svg
							width="auto"
							height="auto"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M9.71069 18.2929C10.1012 18.6834 10.7344 18.6834 11.1249 18.2929L16.0123 13.4006C16.7927 12.6195 16.7924 11.3537 16.0117 10.5729L11.1213 5.68254C10.7308 5.29202 10.0976 5.29202 9.70708 5.68254C9.31655 6.07307 9.31655 6.70623 9.70708 7.09676L13.8927 11.2824C14.2833 11.6729 14.2833 12.3061 13.8927 12.6966L9.71069 16.8787C9.32016 17.2692 9.32016 17.9023 9.71069 18.2929Z"
								fill="#0F0F0F"
							/>
						</svg>
					</div>
				</>
			)}
		</div>
	);
}
