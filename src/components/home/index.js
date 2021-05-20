import React from 'react'
import './index.css'
import Navbar from '../common/navbar'
import Button from '../common/button'
import Input from '../common/input'

class Home extends React.Component
{
	handleChange()
	{
		this.props.history.push("/Upload")
	}
	render()
	{

	return <div>
		<Navbar {...this.props}/>
		<div className="home-flex">
			<div className="left">
				<div className="icon">
					<img src="/assets/upload-workbook.PNG" alt=""/>	
					<h5>new user</h5>
				</div>
				<div className="form-group">
					<strong>Upload Image</strong>
					<div className="flex">
						<input placeholder="no image selected " onClick={this.handleChange.bind(this)} />
						<Button>Browse</Button>
					</div>
					<div className="flex">
						<small>Supported file type</small>	
						<small>Download Sample</small>	
					</div>
				</div>
				<div className="form-group">
					<strong>Subject</strong>
					<div className="flex">
						<Input type="dropdown" options={["select a options","option1","option2","option3"]} />
						<Button className="btn-circle">Go</Button>
					</div>
				</div>
				

			</div>
			<div className="right">
				<div className="icon">
					<img src="/assets/create-workbook.PNG" alt=""/>	
					<h5>existing user</h5>
					
				</div>
				<div className="form-group">
					<strong>Workbook Title</strong>
					<div className="flex">
						<input placeholder="Enter Workbook Title"/>
						
					</div>
					
				</div>
				<br/>
				<br/>
				<Button onClick={e=>this.props.history.push("/create-workbook")} className="btn-circle">Go</Button>
			</div>
		</div>
	</div>
	}
}
export default Home