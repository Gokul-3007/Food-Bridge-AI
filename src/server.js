import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const port = Number(process.env.PORT) || 5000;

const start = async () => {
    await connectDB();
    app.listen(port, '0.0.0.0', () => {
          console.log(`Backend listening on port ${port}`);
    });
};

start().catch((error) => {
    console.error('Backend startup failed:', error);
    process.exit(1);
});
