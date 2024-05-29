const Router = require('express').Router();
const { generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');

const fs = require('fs');
const path = require('path');

const users = require('./users.json');
const session = require('./session.json');
const credentials = require('./credentials.json');

const decode = function decode(str) {
    const b = Buffer.from(str, 'base64');
    return new Uint8Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};

Router.post('/generate-options', async (req, res) => {
    const { uniqueId } = req.body;
    const options = await generateAuthenticationOptions({
        timeout: 60000,
        userVerification: 'preferred',
        rpID: process.env.WEBAUTHN_RPID,
        allowCredentials: [],
    });

    session[ uniqueId ] = options.challenge;
    fs.writeFileSync(path.join(__dirname, 'session.json'), JSON.stringify(session, null, 4));

    return res.status(200).send(options);
});

Router.post('/verify', async (req, res) => {
    try {
        const { uniqueId, response } = req.body;

        const challenge = session[ uniqueId ];
        session[ uniqueId ] = undefined;
        fs.writeFileSync(path.join(__dirname, 'session.json'), JSON.stringify(session, null, 4));

        const authenticator = credentials.splice(credentials.indexOf(({ credentialID }) => credentialID === Buffer.from(response.rawId).toString('base64')))[ 0 ];

        authenticator.credentialID = decode(authenticator.credentialID);

        authenticator.credentialPublicKey = decode(authenticator.credentialPublicKey);

        // const user = users.find(({ _id }) => _id === authenticator.userId);

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
                credentialID: Buffer.from(authenticator.credentialID).toString('base64'),
                credentialPublicKey: Buffer.from(authenticator.credentialPublicKey).toString('base64'),
                counter: verification.authenticationInfo.newCounter,
            });

            fs.writeFileSync(path.join(__dirname, 'credentials.json'), JSON.stringify(credentials, null, 4));

            return res.status(200).send('JWT Generated');
        }
        return res.status(401).send('Authentication Failed!');
    } catch (error) {
        return res.status(401).send('Authentication Failed!');
    }
});

module.exports = Router;
