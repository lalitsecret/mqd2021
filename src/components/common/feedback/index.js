import React from 'react'
import Button from '../button'
import './index.css'
class Feedback extends React.Component
{
	onClose()
	{
		this.props.onClose()
	}
	render()
	{
		let {status}=this.props

		if(status)
		{
				return <div className={"Feedback"}>
					<div className="Feedback-inner">
						<div className="Feedback-title">Feedback</div>			
						<div className="Feedback-body">
							<p><big>Mistake Category:</big> (optional)</p>
							<p>
								<input type="checkbox"/> Recognition
							</p>
							<p>
								<input type="checkbox"/> Formatting
							</p>
							<p>
								<input type="checkbox"/> Other
							</p>
							<p><strong>Please tell us more so we can fix this issue:</strong> (optional)</p>
							<p><strong>Reports</strong></p>
							<textarea  cols="50" rows="10"></textarea>
							
						</div>			
						<div className="Feedback-actions">
							<Button onClick={this.onClose.bind(this)} className="btn btn-circle">cancel</Button>
							<Button className="btn btn-circle">submit</Button>
						</div>			
					</div>	
				</div>	
			}
			else
			{
				return null
			}
		}
}
export default Feedback;