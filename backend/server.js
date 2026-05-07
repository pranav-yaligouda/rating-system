import app from './app.js';
import sequelize from './config/database.js';

const PORT = process.env.PORT;

const startServer = async() => {
    try {
        await sequelize.authenticate();
        console.log('Database Connected');

        app.listen(PORT, ()=>{
            console.log(`Server running on port ${PORT}`);
        })
    } catch (err) {
        console.error('Database connection failed', err);
        process.exit(1);
    }
}

startServer();