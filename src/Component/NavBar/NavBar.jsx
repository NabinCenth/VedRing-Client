import React from 'react'
import './NavBar.css'
import img from '../../assets/logo.png'
function NavBar() {
  return (
   <nav className="navbar">
    
      <div className="navbar-left">
        <img 
          src={img} 
          alt="VedMeet Logo" 
          className="navbar-logo" 
        />
        <span className="navbar-brand">VedRing</span>
      </div>
     <div className="navbar-right">
        <button className="navbar-btn">
          Get Started
        </button>
      </div>
    </nav>
  )
}

export default NavBar