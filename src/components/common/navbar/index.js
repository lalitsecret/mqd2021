import React from 'react'
import {Link} from 'react-router-dom'
import './index.css'

class Navbar extends React.Component
{
	render()
	{
		const getClassName=a=>a.some(x=>x===props.match.url)?"link active":"link"
		let {props}	=this
		return <nav>
			<div className="left">
				<div className="logo">
					<img src="/assets/logo.png" alt=""/>
				</div>
				<div className={getClassName(["/Home","/Upload"])} >
					<Link  to="/Home">
					 <i className="fa fa-2x fa-home"></i>	  Home
					</Link>
				</div>
				<div className={getClassName(["/Library"])} >
					<Link  to="/Library">
					 <i className="fa fa-2x fa-bookmark"></i>	  My Library
					</Link>
				</div>
				<div className={getClassName(["/Tutorial"])} >
					<Link  to="/Tutorial">
					 <i className="fa fa-2x fa-video"></i>	  Tutorial
					</Link>
				</div>
			</div>
			<div className="right">	
				<img src="/assets/avatar.png" alt=""/>
				<strong>Welcome User</strong>	
				<img src="/assets/fa-down.png" alt=""/>
			</div>
		</nav>
		
	}
}



export default Navbar