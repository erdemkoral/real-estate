module.exports = function (role) {
    return (req, res, next) => {
        const {roles} =req.user;
        if(roles && roles.indexOf(role) > -1 ) {
            next();
        }
        else {
            next({ code:403, error: `role ${role} is required to perform this action` });
        }
    };  
};