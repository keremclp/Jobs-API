require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const cors = require('cors')
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean')


const express = require('express');
const app = express();

// connectDB
const connectDB = require('./db/connect')

const authenticatedUser = require('./middleware/authentication')
// routes
const authRoutes = require('./routes/auth')
const jobsRoutes = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
// extra packages
app.set('trust proxy',1)
app.use(rateLimit( {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}))
app.use(helmet());
app.use(cors());
app.use(xss())

// routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', authenticatedUser ,jobsRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
