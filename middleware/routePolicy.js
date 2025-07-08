const fs = require('fs');
const path = require('path');
const metadata = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../routesMetadata.json'), 'utf8')
);

module.exports = (req, res, next) => {

  console.log("🔍 Route Policy - URL:", req.originalUrl);
  const route = metadata.find(r => req.originalUrl.startsWith(r.path));

  console.log("🔍 Found route:", route);
  if (!route) return next(); // Not protected by plan

  // Check if authentication is required for this route
  if (!route.authRequired) {

    console.log("✅ No auth required for this route");
    // No auth required, but still attach route metadata
    req.routeMeta = route;
    return next();
  }

  // Authentication required - check for user
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const allowed = route.plans.includes(user.plan) || route.plans.includes('all');
  if (!allowed) {
    return res.status(403).json({
      success: false,
      message: `Your current plan (${user.plan}) doesn't allow access to this feature`
    });
  }

  // Attach route metadata (like aiGeneration flag) if needed in controller
  req.routeMeta = route;

  next();
};
