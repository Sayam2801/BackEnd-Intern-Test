const jwt = require('jsonwebtoken')

//middleware to check the JWT token

const auth = async (req,res,next)=>{
  const privatekey = 'TEST';//What is this private key?
  // const authHeader = req.header('Authorization');
  // const Token = authHeader ? authHeader.replace('Bearer', '') : '';
  const token = req.header('Authorization').replace('Bearer ', '');
  // const decoded = jwt.verify(token, 'Test');
  console.log('auth Header',token);//Token is not defined...

  try{
    jwt.verify(token,privatekey, function (err, decoded) {
      // console.log('response from verification',err,decoded);
      req.user = decoded;
      if (err) {
        return res.send({
          code: 401,
          message: 'Invalid Token!',
          error:err
        });
      }

      // otherwise authentication pass, call next()
      next();
    });
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate and Token should be generated.' });
  }
}

module.exports = auth;
