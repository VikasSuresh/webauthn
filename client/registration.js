import axios from 'axios';
import { startRegistration } from '@simplewebauthn/browser';

const registration = async () => {
    const { data: options } = await axios.post('http://localhost:3000/registration/generate-options', {
        uniqueId: '6DE3C4F0-DC62-49E3-BD54-A8F3C32D6641',
        userId: '12345678901234567890abcd',
    });

    const response = await startRegistration(options);

    const { data: jwt } = await axios.post('http://localhost:3000/registration/verify', {
        uniqueId: '6DE3C4F0-DC62-49E3-BD54-A8F3C32D6641',
        userId: '12345678901234567890abcd',
        response,
    });

    console.log(jwt);
};

registration();
