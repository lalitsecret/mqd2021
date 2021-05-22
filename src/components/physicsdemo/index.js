import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
class Tutorial extends React.Component
{
	render(){
		return ReactDOM.createPortal(
		    <input type="hidden" class="schematic" height='460' width='800' />,
		    document.getElementById("circuit")
		  );
		
	}
}
export default Tutorial

