import React from 'react'
import './index.css'

class I extends React.Component
{
	state={status:false}
	openTooltip()
	{
		this.setState({status:true})
	}
	closeTooltip()
	{
		this.setState({status:false})
	}
	
	render()
	{
		// let {type}=this.props
		return <b 
		onMouseOver={this.openTooltip.bind(this)} 
		onMouseLeave={this.closeTooltip.bind(this)} 
		className={"i"} >
			{this.state.status&&<i className="tooltip">{this.props.title}</i>}
			<img style={{width:"20px",margin:"-5px"}} src="/assets/i.PNG" alt=""/>
		</b>
	}
}
export default I;