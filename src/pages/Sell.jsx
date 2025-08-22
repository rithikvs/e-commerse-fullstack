import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Sell({ user }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    material: '',
    rating: '',
    stock: 10,
    image: null,
    description: ''
  });
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }));
      if (files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(files[0]);
      } else {
        setPreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'stock' ? Number(value) : value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.price ||
      !formData.material ||
      !formData.rating ||
      !formData.image ||
      !formData.description
    ) {
      alert('Please fill all fields and select an image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const newProduct = {
        name: formData.name,
        price: Number(formData.price),
        material: formData.material,
        rating: Number(formData.rating),
        stock: Number(formData.stock) || 0,
        image: reader.result,
        owner: user?.email || 'guest',
        description: formData.description,
        category: 'Handmade',
        inStock: true
      };
      let savedToDB = false;
      try {
        const response = await fetch('http://localhost:5000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });
        const result = await response.json();
        if (!response.ok) {
          if (result.errors && Array.isArray(result.errors)) {
            alert(result.errors.join('\n'));
          } else {
            alert(result.message || 'Failed to save product to MongoDB');
          }
          console.error('Backend error:', result);
        } else {
          savedToDB = true;
        }
      } catch (err) {
        alert('Error saving product to database. Saving locally instead.');
        console.error('Network error:', err);
      }
      if (!savedToDB) {
        // Save to localStorage for Home page fallback
        const homeProducts = JSON.parse(localStorage.getItem('homeProducts')) || [];
        localStorage.setItem('homeProducts', JSON.stringify([...homeProducts, { ...newProduct, id: Date.now() }]));
      }
      window.alert('Product added successfully! Go to Home page to view your product.');
      setFormData({ name: '', price: '', material: '', rating: '', stock: 10, image: null, description: '' });
      setPreview(null);
      navigate('/');
    };
    reader.readAsDataURL(formData.image);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <h2>Sell a New Product</h2>
      {/* Remove login check, always show form */}
      <>
        {user && (
          <div style={{ marginBottom: '20px' }}>
            <span style={{ marginRight: '10px' }}>Welcome <b>{user.email || user.username}</b></span>
            <button className="deleteButton" style={styles.deleteButton} onClick={handleLogout}>Logout</button>
          </div>
        )}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} style={styles.input} required />
          <input name="price" placeholder="Price" value={formData.price} onChange={handleChange} style={styles.input} required />
          <input name="material" placeholder="Material" value={formData.material} onChange={handleChange} style={styles.input} required />
          <input name="rating" placeholder="Rating (1-5)" value={formData.rating} onChange={handleChange} style={styles.input} required />
          <input name="stock" type="number" min="0" placeholder="Stock (quantity)" value={formData.stock} onChange={handleChange} style={styles.input} />
          <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} style={styles.input} required />
          <input name="image" type="file" onChange={handleChange} style={styles.input} required />
          {preview && <img src={preview} alt="Preview" style={{ width: '120px', margin: '10px auto', objectFit: 'contain', background: '#f8f9fa', borderRadius: '8px' }} />}
          <button type="submit" className="button" style={styles.button}>Add Product</button>
        </form>
      </>
    </div>
  );
}

const styles = {
  deleteButton: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '0.9em',
    transition: 'background-color 0.2s',
    boxShadow: 'none',
    height: '40px',
    lineHeight: '20px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  container: {
    padding: '40px 30px',
    textAlign: 'center',
    minHeight: '80vh',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%)'
  },
  form: {
    maxWidth: '500px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  input: {
    padding: '15px',
    margin: '15px 0',
    borderRadius: '25px',
    border: '2px solid #e9ecef',
    fontSize: '1em',
    transition: 'all 0.3s ease',
    outline: 'none'
  },
  button: {
    padding: '15px 30px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1.1em',
    fontWeight: '600',
    marginTop: '20px',
    transition: 'background-color 0.2s',
    boxShadow: 'none',
    height: '50px',
    lineHeight: '20px',
    outline: 'none',
    boxSizing: 'border-box'
  }
};

export default Sell;

