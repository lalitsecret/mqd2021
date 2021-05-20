import React from 'react'
import './index.css'
import Navbar from '../common/navbar'
import Button from '../common/button'
import Input from '../common/input'

class Library extends React.Component
{

	render(){
	let a=new Array(100).fill(0)
	return <div className="library">
		<Navbar {...this.props}/>
		<div className="filters">
			<div className="item">
				<div className="left-section">
					<span>All Image</span>
					<span>My Liked Images</span>
				</div>
			</div>
			<div className="item item-right">
				<div className="search">
					<Input type="search" placeholder="search..."/>
					<i className="fa fa-search"></i>
				</div>
				<div className="filter">
					<Button className="btn-circle"><i className="fa fa-sort"></i> Filter</Button>
				</div>
			</div>
		</div>
		<div className="content">
			<div className="lib-flex">
				{a.map(x=>
					<div className="item">
						<div className="top">
							<h3>Image</h3>
							<Input type="radio"/>
						</div>
						<div className="bottom">
							<img src="/assets/equation.png" alt=""/>
						</div>
					</div>
				)}
			</div>
		</div>
		<div className="operations">
			<Button>Edit</Button>
			<Button>Rename</Button>
			<Button>Delete</Button>
		</div>
	</div>
}
}
export default Library