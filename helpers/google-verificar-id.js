const {OAuth2Client} = require('google-auth-library');


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleVerificarId = async(tokenId) => 
{
  const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });

  // const payload = ticket.getPayload();
  const { sub:id, email, name, given_name, family_name ,picture, ...rest } = ticket.getPayload();
  
  //const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  return { id, email, name, given_name, family_name ,picture, rest };

}



module.exports = {
  googleVerificarId
}
