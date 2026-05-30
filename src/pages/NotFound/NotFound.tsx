import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>Page non trouvée</p>
      <Link to="/" className="back-link">Retour à l'accueil</Link>
    </div>
  )
}

export default NotFound