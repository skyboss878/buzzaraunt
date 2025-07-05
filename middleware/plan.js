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
  };
};
