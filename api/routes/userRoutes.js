const express = require('express');

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
const userController = require('../controllers/userController');

const placeholderMiddlewareFunc = () => console.log('placeholder middleware');

router.post('/register', placeholderMiddlewareFunc, userController.signup);
// router.post('/register', (req, res, next) => {
//   const hashedPw = bcrypt.hashSync(req.body.password, 12);

//   User.create(
//     {
//       name: req.body.name,
//       email: req.body.email,
//       password: hashedPw,
//     },
//     (err, user) => {
//       if (err) return next(new Error(err));

//       // create JWT
//       const token = jwt.sign({ id: user._id }, tmpLocalConfig.secret, {
//         expiresIn: 86400, // 24 hrs
//       });
//       return res.status(200).send({ auth: true, token });
//     }
//   );
// });

router.get('/get-user', placeholderMiddlewareFunc, userController.getUser);
// eslint-disable-next-line arrow-body-style
// router.get('/get-user', verifyToken, (req, res) => {
//   return User.findById(
//     req.userId,
//     { password: 0 }, // projection to omit the pw from the response
//     (error, user) => {
//       if (error) return res.status(500).send(`Error looking up user. ${error}`);
//       if (!user) return res.status(400).send('No user found');

//       return res.status(200).json(user);
//     }
//   );
// });

router.post('/login', placeholderMiddlewareFunc, userController.login);
// router.post('/login', (req, res) => {
//   User.findOne({ email: req.body.email }, (err, user) => {
//     if (err) return res.status(500).send('Server error');
//     if (!user) return res.status(404).send('No user found');

//     const pwIsValid = bcrypt.compareSync(req.body.password, user.password);
//     if (!pwIsValid) return res.status(401).send({ auth: false, token: null });
//     const token = jwt.sign({ id: user._id }, tmpLocalConfig.secret, {
//       expiresIn: 86400,
//     });
//     return res.status(200).send({ auth: true, token });
//   });
// });

router.get('/logout', placeholderMiddlewareFunc, userController.logout);
// router.get('/logout', (req, res) => {
//   // There is no actual difference between res.send and res.json, both methods are almost identical. res.json calls res.send at the end
//   // main difference is res.json will convert non objects to json
//   res.status(200).send({ auth: false, token: null });
// });

module.exports = router;
