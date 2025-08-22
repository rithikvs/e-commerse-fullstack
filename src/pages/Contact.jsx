import React from 'react';

function Contact() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h2 style={styles.title}>Contact Us</h2>
        <p style={styles.description}>
          Get in touch with us for any questions, custom orders, or collaborations.
        </p>
        
        <div style={styles.contactInfo}>
          <div style={styles.contactItem}>
            <h3 style={styles.contactTitle}>📧 Email</h3>
            <p style={styles.contactText}>handmade@example.com</p>
          </div>
          
          <div style={styles.contactItem}>
            <h3 style={styles.contactTitle}>📱 Phone</h3>
            <p style={styles.contactText}>+91 98765 43210</p>
          </div>
          
          <div style={styles.contactItem}>
            <h3 style={styles.contactTitle}>📍 Address</h3>
            <p style={styles.contactText}>123 Craft Street, Artisan District, City - 123456</p>
          </div>
          
          <div style={styles.contactItem}>
            <h3 style={styles.contactTitle}>⏰ Business Hours</h3>
            <p style={styles.contactText}>Monday - Friday: 9:00 AM - 6:00 PM</p>
            <p style={styles.contactText}>Saturday: 10:00 AM - 4:00 PM</p>
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
    marginBottom: '20px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  },
  description: {
    fontSize: '1.2em',
    color: '#6c757d',
    lineHeight: '1.6',
    marginBottom: '40px'
  },
  contactInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginTop: '40px'
  },
  contactItem: {
    padding: '25px',
    background: '#f8f9fa',
    borderRadius: '15px',
    border: '1px solid #e9ecef',
    textAlign: 'center'
  },
  contactTitle: {
    color: '#3498db',
    fontSize: '1.3em',
    marginBottom: '15px'
  },
  contactText: {
    color: '#6c757d',
    fontSize: '1em',
    margin: '5px 0'
  }
};

export default Contact;
