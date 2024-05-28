const Router = require('express').Router();
const { generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');

const fs = require('fs');
const path = require('path');

const users = require('./users.json');
const session = require('./session.json');
const credentials = require('./credentials.json');

Router.post('/authentication/generate-options', async (req, res) => {
    const { uniqueId } = req.body;
    const options = await generateAuthenticationOptions({
        timeout: 60000,
        userVerification: 'preferred',
        rpID: process.env.WEBAUTHN_RPID,
        allowCredentials: [],
    });

    session[ uniqueId ] = options.challenge;

    return res.status(200).send(options);
});

Router.post('/authentication/verify', async (req, res) => {
    try {
        const { uniqueId, response } = req.body;

        const challenge = session[ uniqueId ];
        session[ uniqueId ] = undefined;

        const authenticator = credentials.splice(({ credentialID }) => credentialID === response.rawId);

        const user = users.find(({ _id }) => _id === authenticator.userId);

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge: `${ challenge }`,
            expectedOrigin: [process.env.WEBAUTHN_RPORIGIN],
            expectedRPID: process.env.WEBAUTHN_RPID,
            authenticator,
            requireUserVerification: true,
        });

        if (verification.verified && verification.authenticationInfo) {
            credentials.push({
                ...authenticator,
                counter: verification.authenticationInfo.counter,
            });

            fs.writeFileSync(path.join(__dirname, 'creddentials.json'), JSON.stringify(credentials, null, 4));

            return res.status(200).send('JWT Generated');
        }
        return res.status(401).send('Authentication Failed!');
    } catch (error) {
        return res.status(401).send('Authentication Failed!');
    }
});

module.exports = Router;
