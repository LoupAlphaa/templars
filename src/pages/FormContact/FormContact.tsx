import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import './FormContact.css'

interface FormData {
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
}

const SKILLS_OPTIONS = [
  { name: 'Architecte', description: 'Conçois les build de A a Z avec imagination sans reproduction ni schématique' },
  { name: 'Builder', description: 'Réalisation de build à partir d\'un schématique ou modèle' },
  { name: 'Décorateur', description: 'Esthétique et design détaillé des bases' },
  { name: 'Redstoneur', description: 'Conçois des système déjà réalisé ou par le biais de tuto' },
  { name: 'Ingénieur', description: 'Conçois soi-même les usines et systèmes redstones' },
  { name: 'Farmer', description: 'Farm de matériaux, de clés de saison etc.. Le minage n\'est pas inclus dans cette catégorie' },
  { name: 'PvE', description: 'Capacité à dompter des Boss redoutable et puissant' },
  { name: 'Mineur', description: 'Mine plus de 10h par semaine' },
  { name: 'Tryhardeur', description: 'Capacité à farm ou miner des journées entières' },
  { name: 'Moddeur', description: 'Capacité à modifier des mods ou éventuellement en créer' },
  { name: 'Comptable', description: 'Gestion et bonne manipulation du logiciel Excel ou Google sheet' },
  { name: 'Développeur', description: 'Capacité à utiliser un ou des langages de programmation' },
]

export default function FormContact() {

  const [user, setUser] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [checkingApplication, setCheckingApplication] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      console.log('Utilisateur actuel:', user)

      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('form_responses')
          .select('*')
          .eq('candidate_id', user.id)
          .maybeSingle()

        setApplication(data)
      }

      setCheckingApplication(false)
    }

    loadUser()
  }, [])

  const signInWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/contact`
      }
    })
  }

  const [formData, setFormData] = useState<FormData>({
    minecraft_pseudo: '',
    irl_name: '',
    age: 0,
    discord_username: '',
    minecraft_experience: '',
    has_previous_factions: false,
    previous_factions_details: '',
    skills: [],
    proud_project: '',
    weekly_playtime: '',
    play_schedule: '',
    motivation: '',
    expected_benefits: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }))
  }

  const handleSkillChange = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      console.log(user)
      console.log(user?.id)
      const { error: insertError } = await supabase
        .from('form_responses')
        .insert([{...formData, candidate_id: user?.id}])

      if (insertError) {
        console.error(insertError)
      }

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        minecraft_pseudo: '',
        irl_name: '',
        age: 0,
        discord_username: '',
        minecraft_experience: '',
        has_previous_factions: false,
        previous_factions_details: '',
        skills: [],
        proud_project: '',
        weekly_playtime: '',
        play_schedule: '',
        motivation: '',
        expected_benefits: ''
      })
      setTimeout(() => {
        setSuccess(false)
        window.location.reload()
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (checkingApplication) {
    return (
      <div className="form-container">
        <h2>Chargement...</h2>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="form-container">
        <h2>Rejoignez les Templiers</h2>
        <div className="discord-login-card">
          <h3>✠ Authentification requise</h3>
          <p>
            Avant de soumettre votre candidature,
            vous devez vous identifier avec votre compte Discord.
          </p>
          <button onClick={signInWithDiscord}>
            Se connecter avec Discord
          </button>
        </div>
      </div>
    )
  }

  if (application) {
    return (
      <div className="form-container">
        <h2>✠ Dossier de candidature</h2>
        <div className="application-status-card">
          <h3>{application.minecraft_pseudo}</h3>
          <div className={`status-badge ${application.status}`}>
            {application.status}
          </div>
          <p>
            Votre candidature a déjà été enregistrée.
          </p>
          {application.status === 'pending' && (
            <p>
              Le Conseil des Templiers examine actuellement votre dossier.
            </p>
          )}
          {application.status === 'accepted' && (
            <p>
              Félicitations ! Votre candidature a été acceptée.
            </p>
          )}
          {application.status === 'rejected' && (
            <p>
              Votre candidature n'a malheureusement pas été retenue.
            </p>
          )}
          {application.admin_comment && (
            <div className="council-message">
              <h4>Message du Conseil</h4>
              <p>{application.admin_comment}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2>Candidature - Rejoignez les Templiers</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="minecraft_pseudo">Pseudo Minecraft *</label>
          <input
            type="text"
            id="minecraft_pseudo"
            name="minecraft_pseudo"
            value={formData.minecraft_pseudo}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="irl_name">Nom IRL (Optionnel)</label>
          <input
            type="text"
            id="irl_name"
            name="irl_name"
            value={formData.irl_name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Âge *</label>
          <input
            type="number"
            id="age"
            name="age"
            min="1"
            max="120"
            value={formData.age}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="discord_username">Nom d'utilisateur Discord *</label>
          <input
            type="text"
            id="discord_username"
            name="discord_username"
            value={formData.discord_username}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="minecraft_experience">Depuis combien de temps jouez-vous à Minecraft ? *</label>
          <input
            type="text"
            id="minecraft_experience"
            name="minecraft_experience"
            placeholder="Ex: 5 ans, depuis la version 1.12..."
            value={formData.minecraft_experience}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group checkbox-group">
          <label htmlFor="has_previous_factions">
            <input
              type="checkbox"
              id="has_previous_factions"
              name="has_previous_factions"
              checked={formData.has_previous_factions}
              onChange={handleChange}
              disabled={loading}
            />
            Avez-vous déjà fait partie d'autres entreprises ou factions ?
          </label>
        </div>

        {formData.has_previous_factions && (
          <div className="form-group">
            <label htmlFor="previous_factions_details">Détails - Noms et rôles *</label>
            <textarea
              id="previous_factions_details"
              name="previous_factions_details"
              value={formData.previous_factions_details}
              onChange={handleChange}
              required={formData.has_previous_factions}
              disabled={loading}
              rows={3}
            />
          </div>
        )}

        <div className="form-group">
          <label>Quelles sont vos compétences principales en jeu ? *</label>
          <div className="skills-grid">
            {SKILLS_OPTIONS.map((skill) => (
              <label key={skill.name} className="skill-card">
                <input
                  type="checkbox"
                  checked={formData.skills.includes(skill.name)}
                  onChange={() => handleSkillChange(skill.name)}
                  disabled={loading}
                />
                <div className="skill-content">
                  <strong>{skill.name}</strong>
                  <small>{skill.description}</small>
                </div>
              </label>
            ))}
          </div>
          {formData.skills.length === 0 && (
            <p className="error-text">Veuillez sélectionner au moins une compétence</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="proud_project">
            Avez-vous une réalisation ou un projet dont vous êtes fier(e) dans Minecraft ?
            (Optionnel)
          </label>
          <textarea
            id="proud_project"
            name="proud_project"
            value={formData.proud_project}
            onChange={handleChange}
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="weekly_playtime">Combien de temps pouvez-vous consacrer à Minecraft par semaine ? *</label>
          <input
            type="text"
            id="weekly_playtime"
            name="weekly_playtime"
            placeholder="Ex: 10-15 heures, 5-10 heures..."
            value={formData.weekly_playtime}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="play_schedule">Quels sont vos horaires de jeu habituels ? *</label>
          <input
            type="text"
            id="play_schedule"
            name="play_schedule"
            placeholder="Ex: Soir en semaine, week-end complet..."
            value={formData.play_schedule}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="motivation">Pourquoi souhaitez-vous rejoindre Les Templiers ? *</label>
          <textarea
            id="motivation"
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            required
            disabled={loading}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="expected_benefits">Qu'est-ce que les Templiers peuvent vous apporter ? *</label>
          <textarea
            id="expected_benefits"
            name="expected_benefits"
            value={formData.expected_benefits}
            onChange={handleChange}
            required
            disabled={loading}
            rows={4}
          />
        </div>

        <button type="submit" disabled={loading || formData.skills.length === 0}>
          {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
        </button>
      </form>

      {success && (
        <div className="alert alert-success">
          ✓ Votre candidature a été reçue avec succès! Les administrateurs l'examineront bientôt.
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          ✗ Erreur: {error}
        </div>
      )}
    </div>
  )
}
