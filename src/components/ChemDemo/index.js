import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
const data=<div 
						id="chemComposer" 
						data-widget="Kekule.Editor.Composer" 
						 >
		</div> 
class Upload extends React.Component
{
	render(){
		return ReactDOM.createPortal(
		    data,
		    document.getElementById("may20")
		  );
		
	}
}
export default Upload