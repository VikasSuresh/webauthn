const Router = require('express').Router();
const { generateRegistrationOptions, verifyRegistrationResponse } = require('@simplewebauthn/server');
const fs = require('fs');
const path = require('path');

const users = require('./users.json');
const session = require('./session.json');
const credentials = require('./credentials.json');

Router.post('/register/generate-options', async (req, res) => {
    const { userId, uniqueId } = req.body;

    const user = users.find((u) => u._id === userId);
    if (!user) return res.status(404).send('User Not Found!');

    const options = await generateRegistrationOptions({
        rpName: process.env.WEBAUTHN_RPNAME,
        rpID: process.env.WEBAUTHN_RPID,
        userID: user.id,
        userName: user.username,
        timeout: 60000,
        attestationType: 'none',
        excludeCredentials: [],
        authenticatorSelection: {
            residentKey: 'required',
            userVerification: 'preferred',
        },
        supportedAlgorithmIDs: [-7, -257],
    });

    session[ uniqueId ] = options.challenge;

    return res.status(200).send(options);
});

Router.post('/register/verify', async (req, res) => {
    try {
        const { uniqueId, userId, response } = req.body;

        const challenge = session[ uniqueId ];
        session[ uniqueId ] = undefined;

        const verification = await verifyRegistrationResponse({
            response,
            expectedChallenge: challenge,
            expectedOrigin: [process.env.WEBAUTHN_RPORIGIN],
            expectedRPID: process.env.WEBAUTHN_RPID,
            requireUserVerification: true,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

            credentials.push({
                uniqueId,
                userId,
                credentialID,
                credentialPublicKey,
                counter,
            });

            fs.writeFileSync(path.join(__dirname, 'credentials.json'), JSON.stringify(credentials, null, 4));

            return res.status(200).send('JWT Generated');
        }
        return res.status(401).send('Registration Failed!');
    } catch (error) {
        return res.status(401).send('Registration Failed!');
    }
});

module.exports = Router;
