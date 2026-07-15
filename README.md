# CAB-BOOKING 🚗

A full-stack cab booking application built with modern web technologies. This platform enables users to book rides seamlessly, with real-time tracking, payment integration, and comprehensive admin features.

## 🌟 Features

### User Features
- **Easy Booking**: Intuitive interface for booking cabs
- **Real-time Tracking**: Live location tracking of assigned cabs with Google Maps integration
- **Payment Gateway**: Razorpay integration for secure payments
- **Ride History**: View past bookings and ride details
- **Multi-language Support**: i18n support for internationalization
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Socket.io Integration**: Real-time updates and notifications

### Admin Features
- **Dashboard Analytics**: Charts and analytics using Chart.js and Recharts
- **Ride Management**: Monitor and manage all rides
- **User Management**: Manage user accounts and profiles
- **Payment Tracking**: Track all transactions
- **PDF Reports**: Generate PDF reports of rides and payments

### Technical Features
- **Security**: JWT authentication, bcrypt password hashing, rate limiting, Helmet for headers
- **Error Handling**: Sentry integration for error tracking
- **API Documentation**: Swagger UI for API documentation
- **Logging**: Winston logger with daily rotation
- **CORS Support**: Cross-origin resource sharing enabled

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library
- **Vite 8.1** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Router DOM 7.18** - Client-side routing
- **Framer Motion 12.42** - Animation library
- **Socket.io Client 4.8** - Real-time communication
- **Chart.js & Recharts** - Data visualization
- **Google Maps API** - Maps integration
- **i18next** - Internationalization

### Backend
- **Node.js & Express 5.2** - Server framework
- **MongoDB & Mongoose 9.7** - Database and ODM
- **JWT** - Authentication
- **Razorpay** - Payment processing
- **Socket.io 4.8** - Real-time communication
- **Helmet** - HTTP header security
- **Express Rate Limit** - API rate limiting
- **Winston** - Logging
- **Sentry** - Error tracking
- **Swagger** - API documentation

## 📁 Project Structure

```
CAB-BOOKING/
├── Project/
│   ├── client/                 # React frontend application
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   ├── server/                 # Express.js backend application
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   └── ...
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sahid-raza-7890/CAB-BOOKING.git
   cd CAB-BOOKING
   ```

2. **Setup Backend**
   ```bash
   cd Project/server
   npm install
   ```
   
   Create a `.env` file in `Project/server/`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/cab-booking
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   SENTRY_DSN=your_sentry_dsn
   ```

3. **Setup Frontend**
   ```bash
   cd Project/client
   npm install
   ```
   
   Create a `.env` file in `Project/client/`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

### Running the Application

**Backend:**
```bash
cd Project/server
npm start
```

**Frontend:**
```bash
cd Project/client
npm run dev
```

The frontend will be available at `http://localhost:5173` (Vite default)
The backend API will be available at `http://localhost:5000`

### Building for Production

**Frontend:**
```bash
cd Project/client
npm run build
```

**Backend:**
```bash
cd Project/server
src/server.js
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:5000/api/docs`

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Passwords are hashed using bcryptjs
- JWT tokens are issued upon successful login
- Include the token in the Authorization header: `Bearer <token>`

## 💳 Payment Integration

Razorpay is integrated for payment processing:
- Secure payment gateway
- Multiple payment methods supported
- Transaction tracking and receipts

## 🗺️ Real-time Features

Socket.io is used for real-time updates:
- Live ride tracking
- Real-time notifications
- Instant rider-driver communication

## 📊 Analytics & Reporting

- Dashboard with comprehensive analytics
- Interactive charts using Chart.js and Recharts
- PDF report generation for rides and payments
- User activity tracking

## 🧪 Testing

Backend tests can be run with:
```bash
cd Project/server
npm test
```

## 📝 Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `RAZORPAY_KEY_ID` | Razorpay API key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `SENTRY_DSN` | Sentry error tracking DSN |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key |

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Express rate limit to prevent abuse
- **Security Headers**: Helmet.js for HTTP header security
- **CORS**: Configured CORS for trusted origins
- **Error Tracking**: Sentry integration for monitoring

## 🌐 Internationalization

The app supports multiple languages using i18next:
- English
- [Add other supported languages]

Switch language from the app settings.

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop browsers
- Tablets
- Mobile devices

## 🐛 Debugging & Error Tracking

- **Sentry**: Automatic error tracking and reporting
- **Winston Logs**: Detailed application logging with daily rotation
- **Swagger UI**: API endpoint testing and documentation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

**Sahid Raza**
- GitHub: [@sahid-raza-7890](https://github.com/sahid-raza-7890)

## 📞 Support

For support, please open an issue on the GitHub repository or contact the maintainer.

## 🔗 Related Resources

- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Socket.io Documentation](https://socket.io/docs)
- [Razorpay Documentation](https://razorpay.com/docs)
- [Google Maps API](https://developers.google.com/maps)

---

**Happy Booking! 🎉**
