import React from 'react'
import './index.css'
import Navbar from '../common/navbar'
class Tutorial extends React.Component
{
	render()
	{

		return <div className="tutorial-container">
		<Navbar {...this.props}/>
		<div className="video">
			<video controls width="800" src="/assets/tutorial.mp4"></video>
		</div>
		<div className="description">
			<h4>Here is a brief product</h4>
			<p>
				Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
				tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
				quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
				consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
				cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
				proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
			</p>
		</div>
	</div>
}
}
export default Tutorial