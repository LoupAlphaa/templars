import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h1>⚔️ Templars</h1>
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/">Accueil</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
