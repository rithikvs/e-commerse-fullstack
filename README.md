# 🎨 Handmade Crafts E-commerce Website

A beautiful and professional e-commerce platform for handmade crafts, built with React frontend and Node.js backend with MongoDB.

## ✨ Features

- **Professional Design**: Modern, responsive design with smooth animations and hover effects
- **Product Management**: Add, edit, and delete products with image uploads
- **Shopping Cart**: Full cart functionality with MongoDB persistence
- **User Authentication**: Login/Register system for buyers and sellers
- **Responsive Layout**: Works perfectly on all devices
- **MongoDB Integration**: Robust backend with proper data validation
- **Real-time Updates**: Live product updates and cart synchronization

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd latest
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up MongoDB**
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud service)
   - Create a database named `handmade_crafts`

5. **Configure environment variables**
   Create a `.env` file in the `backend` folder:
   ```env
   MONGO_URI=mongodb://localhost:27017/handmade_crafts
   PORT=5000
   NODE_ENV=development
   ```

6. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:5000`

7. **Start the frontend development server**
   ```bash
   # In a new terminal, from the root directory
   npm run dev
   ```
   The website will open at `http://localhost:5173`

## 🏗️ Project Structure

```
latest/
├── src/                    # Frontend source code
│   ├── pages/             # Page components
│   ├── assets/            # Images and static files
│   └── App.jsx            # Main application component
├── backend/               # Backend server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── server.js          # Express server
├── public/                # Public assets
└── package.json           # Frontend dependencies
```

## 🔧 Backend API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id/:owner` - Delete product
- `GET /api/products/owner/:email` - Get products by owner

### Cart
- `GET /api/cart/:userEmail` - Get user's cart
- `POST /api/cart/save` - Save/update cart
- `DELETE /api/cart/:userEmail` - Clear user's cart

### Health Check
- `GET /api/health` - Server status

## 🎨 Design Features

- **Modern UI**: Clean, professional design with gradient backgrounds
- **Hover Effects**: Smooth animations and transitions
- **Responsive Grid**: Adaptive layout for all screen sizes
- **Professional Typography**: Clear hierarchy and readability
- **Color Scheme**: Consistent color palette throughout
- **Card Design**: Beautiful product cards with shadows and borders

## 🛠️ Technologies Used

### Frontend
- React 18
- React Router
- CSS3 with modern features
- Vite for fast development

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin requests

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🔒 Security Features

- Input validation and sanitization
- MongoDB injection protection
- Proper error handling
- User authorization checks

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy the `backend` folder
3. Update frontend API URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure MongoDB is running
3. Verify all dependencies are installed
4. Check the API endpoints are accessible

## 🎯 Future Enhancements

- Payment gateway integration
- User reviews and ratings
- Advanced search and filtering
- Admin dashboard
- Email notifications
- Image optimization
- PWA capabilities

---

**Happy Crafting! 🎨✨**
