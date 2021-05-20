// react scope to write jsx
import React from 'react'
// react dom to render in public/index.html div#root
import ReactDOM from 'react-dom'
//common style for font family
import './assets/style.css'

//common store configured from store/index

import Main from './store/'

//finally rendering the store as provider in main website
ReactDOM.render(<Main/>,document.getElementById("root"))