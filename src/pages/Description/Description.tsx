import './Description.css'

function Description() {
  return (
    <div className="description">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="templar-cross"></div>
        <h1 className="main-title">Les Templiers</h1>
        <p className="subtitle">Histoire et Présentation</p>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-card">
            <h2>Qui sont les Templiers ?</h2>
            <p>
              Les Templiers [TMPL] sont une organisation militaire d'élite sur le serveur semi-RP Moonaris. 
              Fondée sur les principes de puissance, d'honneur et de camaraderie, notre faction possède les meilleurs atouts.
            </p>
            <p>
              Avec des joueurs expérimentés et une structure organisée, nous offrons bien plus qu'une simple team : 
              nous offrons une communauté, une protection et des opportunités uniques.
            </p>
          </div>

          <div className="stats-section">
            <h2>Nos Chiffres</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">10+</div>
                <div className="stat-label">Membres actifs</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">10000+</div>
                <div className="stat-label">Heures cumulées</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">Conquête</div>
                <div className="stat-label">1ère team sur Sunaris</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">2023</div>
                <div className="stat-label">Année de fondation</div>
              </div>
            </div>
          </div>

          <div className="values-section">
            <h2>Nos Valeurs</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">⚔️</div>
                <h3>Puissance</h3>
                <p>Nous recherchons l'excellence en toutes choses</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🛡️</div>
                <h3>Honneur</h3>
                <p>Le respect et l'intégrité sont nos fondements</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Camaraderie</h3>
                <p>Unis nous sommes plus forts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="history-section">
        <h2>Notre Héritage</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-date">2023</div>
            <div className="timeline-content">
              <h3>Fondation des Templiers</h3>
              <p>Naissance d'une organisation révolutionnaire sur Sunaris</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">2023-2024</div>
            <div className="timeline-content">
              <h3>Expansion</h3>
              <p>Croissance constante et domination du serveur</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">Aujourd'hui</div>
            <div className="timeline-content">
              <h3>Le Retour</h3>
              <p>Retour des Templiers sur Moonaris</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-date">Demain</div>
            <div className="timeline-content">
              <h3>Ambition</h3>
              <p>Domination sur tous les plans. Faire revenir Les Templiers à leur Âge d'Or</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Description
