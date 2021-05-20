import React from 'react'

class Input extends React.Component
{
	render()
	{
		let {type}=this.props
		if(type==="dropdown")
		{
			let {options}=this.props
			return <select {...this.props} onChange={this.props.onChange}>
				{options.map(x=><option value={x}>{x}</option>)}
			</select>	
		}
		else
		{
			return <input onChange={e=>this.props.onChange} {...this.props} />
		}
	}
}
export default Input;