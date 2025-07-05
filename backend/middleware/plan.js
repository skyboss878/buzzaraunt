// backend/middleware/plan.js
module.exports = function checkPlan(allowedPlans) {
  return function (req, res, next) {
    if (!req.user || !req.user.plan) {
      return res.status(403).json({ success: false, message: 'No plan info available' });
    }

    if (!allowedPlans.includes(req.user.plan)) {
      return res.status(403).json({ success: false, message: 'Your plan does not allow this feature.' });
    }

    next();
  };
};
