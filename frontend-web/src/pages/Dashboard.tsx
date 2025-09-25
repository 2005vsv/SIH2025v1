import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import analyticsAPI from "@/api/analyticsAPI"; // make sure this has getMyCertificates()
import { CertificateQR } from "@/components/CertificateQR"; // your QR component
import { IUser } from "@/types/user";
import { useAuth } from "@/context/AuthContext";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        if (user?.role === "student") {
          // Fetch student's certificates
          const certResponse = await analyticsAPI.getMyCertificates(); // must return { data: { data: { certificates: [...] } } }
          const myCerts = certResponse.data?.data?.certificates || [];
          setCertificates(myCerts);

          // fetch fees, notifications etc.
          // const feesRes = await feesAPI.getMyFees();
          // setFees(feesRes.data.data);
          // const notifRes = await notifAPI.getMyNotifications();
          // setNotifications(notifRes.data.data);
        }

        // fetch stats/achievements/events as before
        // const statsRes = await analyticsAPI.getStats();
        // setStats(statsRes.data.data);
        // const achRes = await achievementsAPI.getMyAchievements();
        // setAchievements(achRes.data.data);
        // const eventsRes = await eventsAPI.getUpcoming();
        // setEvents(eventsRes.data.data);

      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user?.name} 👋</h1>

      {/* Stats Section */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Example stat card */}
          <div className="bg-white p-4 rounded-xl shadow border">
            <h3 className="text-gray-600">Total Certificates</h3>
            <p className="text-2xl font-bold">{certificates.length}</p>
          </div>
          {/* Add other stats as you already have */}
        </motion.div>
      )}

      {/* Quick Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Your quick action buttons go here */}
        </div>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
      >
        <h2 className="text-xl font-bold mb-4">📌 Recent Activities</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No recent activities.</p>
        ) : (
          <ul className="list-disc pl-5">
            {notifications.map((n, idx) => (
              <li key={idx}>{n.message}</li>
            ))}
          </ul>
        )}
      </motion.div>

      {/* Events Section */}
      {events.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold mb-4">📅 Upcoming Events</h2>
          <ul className="space-y-2">
            {events.map((e, idx) => (
              <li key={idx}>
                <strong>{e.title}</strong> – {new Date(e.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold mb-4">🏆 Achievements</h2>
          <ul className="space-y-2">
            {achievements.map((a, idx) => (
              <li key={idx}>{a.title}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* My Certificates Section */}
      {certificates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold mb-4">🎓 My Certificates</h2>

          {certificates.map((cert) => (
            <div key={cert._id} className="mb-6 p-4 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{cert.title}</h3>
                  <p className="text-gray-600">Type: {cert.type}</p>
                  <p className="text-sm text-gray-500">
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                </div>

                {cert.qrCode && (
                  <CertificateQR
                    qrCode={cert.qrCode}
                    verificationUrl={cert.verificationUrl}
                    certificateType={cert.type}
                  />
                )}
              </div>

              {cert.blockchainTxHash && (
                <div className="mt-2">
                  <a
                    href={`https://sepolia.etherscan.io/tx/${cert.blockchainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm hover:underline"
                  >
                    🔗 View on Blockchain
                  </a>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
