import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <span className="brand-icon">⚔️</span>
                    <span className="brand-text">Templiers</span>
                </Link>

                <button 
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                <ul className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <li>
                        <Link to="/" onClick={closeMenu}>Accueil</Link>
                    </li>
                    <li>
                        <Link to="/description" onClick={closeMenu}>Qui sommes-nous ?</Link>
                    </li>
                    <li>
                        <Link to="/contact" onClick={closeMenu} className="navbar-apply">Candidater</Link>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar