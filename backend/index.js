require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
const cors = require('cors');
const cookieParser = require('cookie-parser');

const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser()); 

const teacherRoutes = require('./src/routes/teacherRoute');
app.use('/teacher', teacherRoutes);

const staffRoutes = require('./src/routes/staffRoute');
app.use('/staff', staffRoutes);

const studentRoutes = require('./src/routes/studentRoute');
app.use('/student', studentRoutes);

const assignationRoutes = require('./src/routes/assignationRoute');
app.use('/assignation', assignationRoutes);

const staffProjectRoutes = require('./src/routes/staffProjectRoute');
app.use('/staffproject', staffProjectRoutes);

const userRoutes = require('./src/routes/userRoute');
app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
  })