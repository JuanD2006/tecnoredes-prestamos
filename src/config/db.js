const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tecnoredes_prestamos';
  try {
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB:', uri);
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
