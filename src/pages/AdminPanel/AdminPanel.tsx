import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './AdminPanel.css'

interface FormResponse {
  id: number
  num_formulaire: number
  minecraft_pseudo: string
  irl_name: string
  age: number
  discord_username: string
  minecraft_experience: string
  has_previous_factions: boolean
  previous_factions_details: string
  skills: string[]
  proud_project: string
  weekly_playtime: string
  play_schedule: string
  motivation: string
  expected_benefits: string
  status: string
  admin_note: string
  admin_comment: string
  created_at: string
}

export default function AdminPanel() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editNote, setEditNote] = useState('')
  const [editComment, setEditComment] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      if (data.session) {
        fetchResponses()
      }
    } catch (err) {
      console.error('Error checking session:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchResponses = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('form_responses')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setResponses(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setError('')

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (loginError) throw loginError

      setSession(data.session)
      setEmail('')
      setPassword('')
      fetchResponses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setResponses([])
    setSelectedResponse(null)
  }

  const handleUpdateResponse = async () => {
    if (!selectedResponse) return

    try {
      const { error: updateError } = await supabase
        .from('form_responses')
        .update({
          status: editStatus,
          admin_note: editNote,
          admin_comment: editComment,
        })
        .eq('id', selectedResponse.id)

      if (updateError) throw updateError

      setSelectedResponse(null)
      fetchResponses()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    }
  }

  if (loading) {
    return <div className="admin-container">Chargement...</div>
  }

  if (!session) {
    return (
      <div className="admin-container">
        <div className="login-form">
          <h2>Accès Administrateur</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loggingIn}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loggingIn}
              />
            </div>
            <button type="submit" disabled={loggingIn}>
              {loggingIn ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          {error && <div className="alert alert-error">{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Tableau de bord administrateur</h2>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-content">
        <div className="responses-list">
          <h3>Candidatures ({responses.length})</h3>
          {responses.length === 0 ? (
            <p className="no-responses">Aucune candidature pour le moment</p>
          ) : (
            <div className="candidates-list">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className={`candidate-card ${selectedResponse?.id === response.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedResponse(response)
                    setEditStatus(response.status || '')
                    setEditNote(response.admin_note || '')
                    setEditComment(response.admin_comment || '')
                  }}
                >
                  <div className="candidate-header">
                    <strong>{response.minecraft_pseudo}</strong>
                    <span className={`status-badge status-${response.status?.toLowerCase() || 'pending'}`}>
                      {response.status || 'En attente'}
                    </span>
                  </div>
                  <div className="candidate-info">
                    <small>Discord: {response.discord_username}</small>
                    <small>{new Date(response.created_at).toLocaleDateString('fr-FR')}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedResponse && (
          <div className="response-detail">
            <h3>Détails de la candidature #{selectedResponse.num_formulaire}</h3>
            
            <div className="detail-section">
              <h4>Informations personnelles</h4>
              <p><strong>Pseudo Minecraft:</strong> {selectedResponse.minecraft_pseudo}</p>
              <p><strong>Nom IRL:</strong> {selectedResponse.irl_name || 'Non renseigné'}</p>
              <p><strong>Âge:</strong> {selectedResponse.age}</p>
              <p><strong>Discord:</strong> {selectedResponse.discord_username}</p>
            </div>

            <div className="detail-section">
              <h4>Expérience Minecraft</h4>
              <p><strong>Depuis combien de temps:</strong> {selectedResponse.minecraft_experience}</p>
              <p><strong>Temps par semaine:</strong> {selectedResponse.weekly_playtime}</p>
              <p><strong>Horaires de jeu:</strong> {selectedResponse.play_schedule}</p>
              <p><strong>Compétences:</strong> {selectedResponse.skills?.join(', ') || 'N/A'}</p>
              {selectedResponse.proud_project && (
                <p><strong>Projet/Réalisation:</strong> {selectedResponse.proud_project}</p>
              )}
            </div>

            <div className="detail-section">
              <h4>Factions précédentes</h4>
              <p>
                <strong>A participé à d'autres factions:</strong>{' '}
                {selectedResponse.has_previous_factions ? 'Oui' : 'Non'}
              </p>
              {selectedResponse.previous_factions_details && (
                <p><strong>Détails:</strong> {selectedResponse.previous_factions_details}</p>
              )}
            </div>

            <div className="detail-section">
              <h4>Motivation</h4>
              <p><strong>Pourquoi rejoindre:</strong> {selectedResponse.motivation}</p>
              <p><strong>Bénéfices attendus:</strong> {selectedResponse.expected_benefits}</p>
            </div>

            <div className="detail-section admin-actions">
              <h4>Actions administrateur</h4>
              <div className="form-group">
                <label htmlFor="status">Statut</label>
                <select
                  id="status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="">En attente</option>
                  <option value="Accepté">Accepté</option>
                  <option value="Refusé">Refusé</option>
                  <option value="À discuter">À discuter</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="note">Note interne</label>
                <textarea
                  id="note"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={3}
                  placeholder="Vos notes personnelles..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="comment">Commentaire (visible pour le candidat?)</label>
                <textarea
                  id="comment"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={2}
                  placeholder="Message pour le candidat..."
                />
              </div>

              <button onClick={handleUpdateResponse} className="save-btn">
                Sauvegarder les modifications
              </button>
            </div>

            <button
              onClick={() => setSelectedResponse(null)}
              className="close-btn"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
