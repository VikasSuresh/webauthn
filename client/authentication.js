import axios from 'axios';
import { startAuthentication } from '@simplewebauthn/browser';

const authentication = async () => {
    const { data: options } = await axios.post('http://localhost:3000/authentication/generate-options', {
        uniqueId: '12345',
    });

    const response = await startAuthentication(options);

    const { data: jwt } = await axios.post('http://localhost:3000/authentication/verify', {
        uniqueId: '12345',
        response,
    });

    console.log(jwt);
};

authentication();
