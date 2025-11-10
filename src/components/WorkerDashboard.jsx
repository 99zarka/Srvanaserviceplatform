import { Home, Briefcase, DollarSign, Star, User } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route } from "react-router-dom";
import { WorkerOverview } from "./worker-dashboard/WorkerOverview";
import { WorkerTasks } from "./worker-dashboard/WorkerTasks";
import { WorkerEarnings } from "./worker-dashboard/WorkerEarnings";
import { WorkerReviews } from "./worker-dashboard/WorkerReviews";
import { WorkerProfile } from "./worker-dashboard/WorkerProfile";

export function WorkerDashboard() {
  const sidebarItems = [
    { icon: Home, label: "Overview", path: "/worker-dashboard" },
    { icon: Briefcase, label: "My Tasks", path: "/worker-dashboard/tasks" },
    { icon: DollarSign, label: "Earnings", path: "/worker-dashboard/earnings" },
    { icon: Star, label: "Reviews", path: "/worker-dashboard/reviews" },
    { icon: User, label: "Profile", path: "/worker-dashboard/profile" },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName="Alex Johnson"
      userRole="Carpenter"
    >
      <Routes>
        <Route index element={<WorkerOverview />} />
        <Route path="tasks" element={<WorkerTasks />} />
        <Route path="earnings" element={<WorkerEarnings />} />
        <Route path="reviews" element={<WorkerReviews />} />
        <Route path="profile" element={<WorkerProfile />} />
      </Routes>
    </DashboardLayout>
  );
}
