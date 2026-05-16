import admin from "../config/firebaseAdmin.js";
 //every time it receives a request to the BE , this file check if 
 // the token that sent from FE is valid or not, valid =>put the data in req.user
 // else => return 401 error to the FE.

 //Middleware to verify Firebase ID token from Authorization header.


const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Unauthorized: No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Unauthorized: Invalid token",
    });
  }
};

export default verifyToken;