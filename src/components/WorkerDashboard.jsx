import { Home, Briefcase, DollarSign, Star, User, Mail } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import { WorkerOverview } from "./worker-dashboard/WorkerOverview";
import { WorkerTasks } from "./worker-dashboard/WorkerTasks";
import { WorkerEarnings } from "./worker-dashboard/WorkerEarnings";
import { WorkerReviews } from "./worker-dashboard/WorkerReviews";
import { WorkerClientOffers } from "./worker-dashboard/WorkerClientOffers";
import { WorkerTaskDetails } from "./worker-dashboard/WorkerTaskDetails"; // Import WorkerTaskDetails

export function WorkerDashboard() {
  const { user } = useSelector((state) => state.auth); // Get user from Redux state
  const userId = user?.user_id; // Get user ID

  const sidebarItems = [
    { icon: Home, label: "نظرة عامة", path: "/worker-dashboard" },
    { icon: Briefcase, label: "مهامي", path: "/worker-dashboard/tasks" },
    { icon: Mail, label: "عروض العملاء", path: "/worker-dashboard/client-offers" },
    { icon: DollarSign, label: "الأرباح", path: "/worker-dashboard/earnings" },
    { icon: Star, label: "التقييمات", path: "/worker-dashboard/reviews" },
    { icon: User, label: "الملف الشخصي", path: `/profile/${userId}` }, // Use dynamic user ID
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      userName="أليكس جونسون"
      userRole="نجار"
    >
      <Routes>
        <Route index element={<WorkerOverview />} />
        <Route path="tasks" element={<WorkerTasks />} />
        <Route path="tasks/:taskId" element={<WorkerTaskDetails />} /> {/* New route for task details */}
        <Route path="earnings" element={<WorkerEarnings />} />
        <Route path="reviews" element={<WorkerReviews />} />
        <Route path="client-offers" element={<WorkerClientOffers />} />
      </Routes>
    </DashboardLayout>
  );
}
