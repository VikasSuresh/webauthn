# Server
  Run - npm run dev
# Html 
  Run - npm i http-server 
  Run - http-server on html folder so that html page runs on localhost
# Client
  Not Used

## Information
  - Have hardcoded to handle only one user
  - When register is clicked
      -  it calls register/generate-options and generate challenge and options, challenge is stored in session which is later used for verification and options is returned.
      -  the front-end uses options to create public-private-key pair and generate a response
      -  the response is again sent to register/verify, which verifies the response with the challenge which was created previously and then returns jwt.

 - When authenticate is clicked
      -  it calls autentication/generate-options and generate challenge and options, challenge is stored in session which is later used for verification and options is returned.
      -  the front-end uses options to encrypt challenge and generate a response
      -  the response is again sent to autentication/verify, which verifies the response with the challenge which was created previously and then returns jwt.
  
