require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { Authentication, Registration } = require('./routes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/registration', Registration);
app.use('/authentication', Authentication);

const port = 3000;
app.listen(
    port,
    () => {
        console.log(`Server is running on port ${ port }.`);
    },
);
