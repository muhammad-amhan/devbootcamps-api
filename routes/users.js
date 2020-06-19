const express       = require('express');
const filterResults = require('../middlware/data_filter');
const {
    requireToken,
    verifyUserRole,
}  = require('../middlware/auth');

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} = require('../controllers/users');

const User   = require('../models/User');
const router = express.Router();

// By default all below endpoints will require a token and authorize for admins only
router.use(requireToken);
router.use(verifyUserRole('admin'));

router
    .route('/')
    .get(filterResults(User), getUsers)
    .post(createUser);

router
    .route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);


module.exports = router;
