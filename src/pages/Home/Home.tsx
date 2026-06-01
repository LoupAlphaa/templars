import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Les Templiers</h1>
          <p className="hero-subtitle">
            La plus grande organisation militaire du serveur Moonaris
          </p>
          <p className="hero-description">
            Puissance, honneur, et domination - Bienvenue dans l'élite
          </p>
          <div className="hero-buttons">
            <button className="cta-button primary">Rejoindre la Team</button>
            <button className="cta-button secondary">Nos Services</button>
          </div>
        </div>
        <div className="hero-background"></div>
      </section>

      {/* About Teaser Section */}
      <section className="about-teaser">
        <div className="teaser-content">
          <h2>Qui sont les Templiers ?</h2>
          <p>
            Les Templiers [TMPL] sont une organisation militaire d'élite sur le serveur semi-RP Moonaris...
          </p>
          <Link to="/description" className="discover-link">
            Découvrir notre histoire complète →
          </Link>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2>Nos Services</h2>
        <p className="section-subtitle">Ce que nous proposons aux alliés et partenaires</p>
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🛡️</div>
            <h3>Protection</h3>
            <p>Défense contre les raids et les agressions. Sécurité garantie pour vos bases.</p>
            <span className="service-badge">Contrat disponible</span>
          </div>
          <div className="service-card">
            <div className="service-icon">⚔️</div>
            <h3>Conquêtes</h3>
            <p>Expansion territoriale et prise de contrôle de zones stratégiques.</p>
            <span className="service-badge">Sur demande</span>
          </div>
          <div className="service-card">
            <div className="service-icon">💼</div>
            <h3>Alliances</h3>
            <p>Partenariats diplomatiques et contrats commerciaux avantageux.</p>
            <span className="service-badge">Contrat disponible</span>
          </div>
          <div className="service-card">
            <div className="service-icon">💰</div>
            <h3>Commerce</h3>
            <p>Achat/vente de ressources rares et équipements de haute qualité.</p>
            <span className="service-badge">Contrat disponible</span>
          </div>
          <div className="service-card">
            <div className="service-icon">🏗️</div>
            <h3>Construction</h3>
            <p>Construction et fortification de bases militaires et avant-postes.</p>
            <span className="service-badge">Sur demande</span>
          </div>
          <div className="service-card">
            <div className="service-icon">🔍</div>
            <h3>Intelligence</h3>
            <p>Renseignements et surveillance stratégique du serveur.</p>
            <span className="service-badge">Contrat disponible</span>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="why-join">
        <h2>Pourquoi rejoindre les Templiers ?</h2>
        <div className="reasons-grid">
          <div className="reason-card">
            <h3>📍 Communauté Active</h3>
            <p>Une communauté de joueurs passionnés et engagés, toujours prêts à s'entraider.</p>
          </div>
          <div className="reason-card">
            <h3>🎯 Objectifs Clairs</h3>
            <p>Une organisation structurée avec des missions et des objectifs bien définis.</p>
          </div>
          <div className="reason-card">
            <h3>💪 Force Collective</h3>
            <p>La puissance d'une armée unie face aux défis de Moonaris.</p>
          </div>
          <div className="reason-card">
            <h3>🏆 Prestige</h3>
            <p>Rejoignez l'élite du serveur et gagnez en influence et en respect.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Prêt à devenir un Templier ?</h2>
        <p>Deux chemins s'offrent à vous : intégrez notre organisation ou collaborez avec nous</p>
        
        <div className="cta-options">
          <div className="cta-box recruitment">
            <h3>🎖️ Recrutement</h3>
            <p>Rejoignez l'armée des Templiers et devenez membre à part entière de notre organisation.</p>
            <button className="cta-button primary">Candidater maintenant</button>
          </div>
          
          <div className="cta-box contracts">
            <h3>📜 Contrats</h3>
            <p>Travaillez avec nous sur des projets spécifiques et bénéficiez de nos services.</p>
            <button className="cta-button secondary" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <h2>Nous Contacter</h2>
        <p>Pour toutes infos supplémentaires, veuillez choisir ces moyens de communications :</p>
        <div className="contact-methods">
          <a href="https://discord.gg/SJsAQnkz44" className="contact-button" id="contact">
            <span>💬</span> Discord
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home