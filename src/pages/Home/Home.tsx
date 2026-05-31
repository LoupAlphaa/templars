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

      {/* About Section */}
      <section className="about">
        <div className="about-content">
          <h2>Qui sont les Templiers ?</h2>
          <p>
            Les Templiers [TMPL] sont une organisation militaire d'élite sur le serveur semi-RP Moonaris. 
            Fondée sur l'ancien serveur semi-rp Sunaris sur les principes de puissance, d'honneur et de camaraderie, notre faction domine le paysage 
            politique, militaire et économique du serveur.
          </p>
          <p>
            Avec des joueurs expérimentés et une structure organisée, nous offrons bien plus qu'une simple team : 
            nous offrons une communauté, une protection et des opportunités.
          </p>
          
          <div className="stats-grid">
            <div className="stat">
              <h3>15+</h3>
              <p>Membres actifs</p>
            </div>
            <div className="stat">
              <h3>2000+</h3>
              <p>Heures cumulées</p>
            </div>
            <div className="stat">
              <h3>Moonaris</h3>
              <p>Serveur semi-RP</p>
            </div>
            <div className="stat">
              <h3>2023</h3>
              <p>Année de création</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <h2>Nos Services</h2>
        <p className="section-subtitle">Ce que nous proposons aux alliés et partenaires</p>
        <div className="services-grid">
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
            <button className="cta-button secondary">Nous contacter</button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <h2>Nous Contacter</h2>
        <p>Discord, Minecraft ou forums - Choisissez votre moyen de communication</p>
        <div className="contact-methods">
          <a href="#" className="contact-button">
            <span>💬</span> Discord
          </a>
          <a href="#" className="contact-button">
            <span>🎮</span> Minecraft IGN
          </a>
          <a href="#" className="contact-button">
            <span>📧</span> Email
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home