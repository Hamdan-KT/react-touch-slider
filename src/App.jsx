import './App.css'
import Slider from './shared/Slider'
import images from "./images"

function App() {
  return (
		<>
			<main>
				<u>
					<h3 style={{ fontFamily: "monospace" }}>
						Responsive to Parent Element's width
					</h3>
				</u>
				<div className="container">
					<Slider scaleEffect keyEvent>
						{images?.map((img, index) => (
							<img
								src={img}
								alt="Image Not Fount"
								key={index}
							/>
						))}
					</Slider>
				</div>
				<div className="box-1">
					<Slider scaleEffect>
						{images?.map((img, index) => (
							<img
								src={img}
								alt="Image Not Fount"
								key={index}
							/>
						))}
					</Slider>
				</div>
				<div className="box-2">
					<Slider scaleEffect>
						{images?.map((img, index) => (
							<img
								src={img}
								alt="Image Not Fount"
								key={index}
							/>
						))}
					</Slider>
				</div>
				<div className="box-3">
					<Slider scaleEffect>
						{images?.map((img, index) => (
							<img
								src={img}
								alt="Image Not Fount"
								key={index}
							/>
						))}
					</Slider>
				</div>
				<div className="box-4">
					<Slider scaleEffect>
						{images?.map((img, index) => (
							<img
								src={img}
								alt="Image Not Fount"
								key={index}
							/>
						))}
					</Slider>
				</div>
			</main>
		</>
	);
}

export default App
