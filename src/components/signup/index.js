import React from 'react'
import {Link} from 'react-router-dom'
import Button from '../common/button'
import Input from '../common/input'
import './index.css'

class Signup extends React.Component
{
	handleSubmit(e)
	{
		e.preventDefault()

		this.props.history.push("/")
	}
	render()
	{
		 return <div className="container-signup">
					<div className="signup-form">
						<div className="left">
							<img src="/assets/login-banner.jpg" alt=""/>
						</div>
						<div className="right">
							<form onSubmit={this.handleSubmit.bind(this)}>
								<h1>Sign Up</h1>
								<div className="form-group">
									<label htmlFor="Name">Name</label>
									<Input type="text" placeholder="Enter Name" className="form-control input-radius"/>
								</div>
								<div className="form-group">
									<label htmlFor="Email">Email Id</label>
									<Input type="email" placeholder="Enter Email-ID" className="form-control input-radius"/>
								</div>
								<div className="form-group">
									<label htmlFor="Password">Password</label>
									<Input type="password" placeholder="Enter Password" className="form-control input-radius"/>
								</div>

								<div className="text-right">
									<a href="">Forget Password ?</a>
								</div>
								<div className="form-checkbox">
									<Input type="checkbox"/>
									By Continuing you accept the <strong>terms and condition</strong> of the <strong>company</strong>
								</div>		
								<div className="form-button">
									<Button className="btn-circle">Sign Up</Button>
								</div>
								<div className="form-or">
									<h3>Or</h3>
								</div>	
								<div className="form-google">
									<img align="middle" width="30" src="/assets/google.png"/> Signin with Google
								</div>
								<div className="form-new-user">
									<Link to="/"><strong>existing User</strong> ? 	</Link>
								</div>
							</form>		

						</div>
					</div>
			</div>		
	}
}


export default Signup