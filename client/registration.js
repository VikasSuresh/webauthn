import axios from 'axios';
import { startRegistration } from '@simplewebauthn/browser';

const registration = async () => {
    const { data: options } = await axios.post('http://localhost:3000/register/generate-options', {
        uniqueId: '12345',
        userId: '12345',
    });

    const response = await startRegistration(options);

    const { data: jwt } = await axios.post('http://localhost:3000/register/verify', {
        uniqueId: '12345',
        userId: '12345',
        response,
    });

    console.log(jwt);
};

registration();
