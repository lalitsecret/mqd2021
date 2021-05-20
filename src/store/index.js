import React from 'react'
import App from '../components'
import store from  './store'
import {Provider} from 'react-redux'
/*
creating store for entire app
with reducer
and components 
adding App component that contains main routing
*/

class Main extends React.Component
{
	render()
	{
		return <Provider store={store}><App/></Provider>	
	}
}
export default Main
// export outside utilised in src/index.js