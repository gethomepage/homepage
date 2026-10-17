import { withAuth } from "utils/auth";
import { invalidateDashboardData } from "utils/config/dashboard";

async function handler(req, res) {
  invalidateDashboardData();
  return res.json({ revalidated: true });
}

export default withAuth(handler);
