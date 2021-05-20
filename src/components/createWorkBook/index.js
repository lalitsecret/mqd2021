import React from 'react'
import './index.css'
import Navbar from '../common/navbar'
import Button from '../common/button'
class Tutorial extends React.Component
{
	render()
	{

		return <div className="create-workbook">
		<Navbar {...this.props}/>
		<div className="create-workbook-inner">
			<div className="line1">
				<div>
					<label htmlFor="sampel1">Workbook Title</label>
					<input placeholder="enter Workbook Title"/>
				</div>
				<div>
					<label htmlFor="sampel1">subject</label>
					<input placeholder="enter subject"/>
				</div>
				<div>
					<label htmlFor="sampel1">Class</label>
					<input placeholder="enter Class"/>
				</div>
			</div>
			<div className="line2">
				<label htmlFor="Description">Description</label>
				<textarea  cols="100" rows="10"></textarea>
			</div>	
			
			<div className="line3">
				<label htmlFor="Upload">Upload Image</label>
				<div className="flex">
					<div className="left">
						<input />
						<Button>Browser</Button>
						
					</div>
					<div className="right">
						<Button className="btn btn-circle">Go</Button>
					</div>
				</div>
			</div>
		</div>
	</div>
}
}
export default Tutorial