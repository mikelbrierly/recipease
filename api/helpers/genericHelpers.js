/* eslint-disable arrow-body-style */
// const { roles } = require('../auth/middleware/roles');

module.exports = {
  // if there is no createdById, then the resource is generic and can be accessed by anyone
  isAccessingOwn: (userId, createdById) => !createdById || userId === createdById,

  // permissionTo: (action, resource) => {
  //   return (req, res, next) => {
  //     try {
  //       const permissionTo = roles.can(req.user.role)[action](resource).granted;
  //       if (!permissionTo) {
  //         return res.status(401).json({
  //           error: "You don't have enough permission to perform this action",
  //         });
  //       }
  //       return next();
  //     } catch (error) {
  //       return next(error);
  //     }
  //   };
  // },
};
