import React from 'react';

function About() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>About Us</h2>
        <p style={styles.description}>
          We are passionate artisans offering one-of-a-kind handmade craft products. 
          Each item tells a story of tradition and creativity, crafted with love and dedication.
        </p>
        <div style={styles.features}>
          <div style={styles.feature}>
            <h3 style={styles.featureTitle}>🎨 Handcrafted Excellence</h3>
            <p>Every product is carefully crafted by skilled artisans with years of experience.</p>
          </div>
          <div style={styles.feature}>
            <h3 style={styles.featureTitle}>🌱 Sustainable Materials</h3>
            <p>We use eco-friendly and sustainable materials to create beautiful, long-lasting crafts.</p>
          </div>
          <div style={styles.feature}>
            <h3 style={styles.featureTitle}>💝 Unique Designs</h3>
            <p>Each piece is unique, ensuring you own something truly special and one-of-a-kind.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 30px',
    textAlign: 'center',
    minHeight: '80vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)'
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'white',
    padding: '50px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  title: {
    color: '#2c3e50',
    fontSize: '2.5em',
    fontWeight: '700',
    marginBottom: '30px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  },
  description: {
    fontSize: '1.2em',
    color: '#6c757d',
    lineHeight: '1.6',
    marginBottom: '40px'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '30px',
    marginTop: '40px'
  },
  feature: {
    padding: '25px',
    background: '#f8f9fa',
    borderRadius: '15px',
    border: '1px solid #e9ecef'
  },
  featureTitle: {
    color: '#3498db',
    fontSize: '1.3em',
    marginBottom: '15px'
  }
};

export default About;
