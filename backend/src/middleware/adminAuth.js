export function adminAuth(req, res, next) {
  const adminKey = req.header("x-admin-key");
  const configuredAdminKey = process.env.ADMIN_KEY || "tsegay@shire";

  if (!adminKey || adminKey !== configuredAdminKey) {
    return res.status(401).json({ message: "Unauthorized admin key." });
  }

  next();
}
