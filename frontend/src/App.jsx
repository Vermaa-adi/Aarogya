import React from 'react'
import {Routes, Route} from 'react-router-dom'
import LandingPage from './pages'

const App = () => {
  return (
    <Routes>
      <Route path='/landing' element={<LandingPage/>} />
    </Routes>
  )
}

export default App
