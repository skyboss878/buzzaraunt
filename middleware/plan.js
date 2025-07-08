// middleware/plan.js
module.exports = function checkPlan(allowedPlans) {
  return (req, res, next) => {
    try {
      const userPlan = req.user?.plan || 'free';

      if (!allowedPlans.includes(userPlan)) {
        return res.status(403).json({
          success: false,
          message: `This feature is only available on: ${allowedPlans.join(", ")} plans.`
        });
      }

      next();
    } catch (err) {
      console.error("Plan check error:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
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
