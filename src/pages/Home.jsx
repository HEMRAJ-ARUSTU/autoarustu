import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiUserCheck, FiPhone, FiTrendingUp, FiFileText, FiDollarSign, FiActivity } from 'react-icons/fi';
import { PostWithToken } from '../ApiMethods/ApiMethods';

const Home = () => {

  const UserData = JSON.parse(sessionStorage.getItem("UserData"));



  const navigate = useNavigate();
  const [stats, setStats] = useState({
    agents: 0,
    suppliers: 0,
    contacts: 0,
    bills: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const agentRes = await PostWithToken("Reference/GetData_Reference", { IsActive: "1" });
      const supplierRes = await PostWithToken("Party/GetData_Party", { IsActive: "1" });
      const contactRes = await PostWithToken("Contact/GetData_Contact", { IsActive: "1" });
      const billRes = await PostWithToken("Bill/GetData_Bill", { IsActive: "1", CreatedDateFrom: "", CreatedDateTo: "" });
      setStats({
        agents: Array.isArray(agentRes) ? agentRes.length : 0,
        suppliers: Array.isArray(supplierRes) ? supplierRes.length : 0,
        contacts: Array.isArray(contactRes) ? contactRes.length : 0,
        bills: Array.isArray(billRes) ? billRes.length : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const quickActions = [
    {
      title: "Add Agent",
      icon: FiUserCheck,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      onClick: () => navigate("/dashboard/agent"),
    },
    {
      title: "Add Supplier",
      icon: FiTruck,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      onClick: () => navigate("/dashboard/supplier"),
    },
    {
      title: "Add Contact",
      icon: FiPhone,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      onClick: () => navigate("/dashboard/contact"),
    },
    {
      title: "Add Bill",
      icon: FiDollarSign,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      onClick: () => navigate("/dashboard/bill"),
    },
  ];

  const statCards = [
    {
      title: "Total Agents",
      value: stats.agents,
      icon: FiUserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Suppliers",
      value: stats.suppliers,
      icon: FiTruck,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Contacts",
      value: stats.contacts,
      icon: FiPhone,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Bills",
      value: stats.bills,
      icon: FiDollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      gradient: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">

      <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-blue-100 text-sm sm:text-base">
            Manage your business operations efficiently from one place
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`rounded-xl border ${card.borderColor} ${card.bgColor} p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mb-2">
                    {card.title}
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {card.value}
                  </p>
                </div>
                <div className={`bg-gradient-to-br ${card.gradient} p-3 rounded-xl shadow-md`}>
                  <Icon className="text-2xl sm:text-3xl text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <FiActivity className="text-xs" />
                <span>Active records</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.onClick}
                className="group rounded-full bg-slate-50 border border-slate-200 px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:border-blue-500 hover:bg-blue-50"
              >
                <div className={`${action.color} w-10 h-10 rounded-full flex items-center justify-center text-white ring-2 ring-white transition-shadow duration-300 group-hover:ring-blue-400 `}>
                  <Icon className="text-lg" />
                </div>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <FiTrendingUp className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <FiUserCheck className="text-blue-600 text-lg" />
                <span className="text-sm font-medium text-slate-700">Active Agents</span>
              </div>
              <span className="font-bold text-lg text-blue-600">{stats.agents}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <FiTruck className="text-blue-600 text-lg" />
                <span className="text-sm font-medium text-slate-700">Active Suppliers</span>
              </div>
              <span className="font-bold text-lg text-blue-600">{stats.suppliers}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <FiPhone className="text-blue-600 text-lg" />
                <span className="text-sm font-medium text-slate-700">Total Contacts</span>
              </div>
              <span className="font-bold text-lg text-blue-600">{stats.contacts}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <FiDollarSign className="text-blue-600 text-lg" />
                <span className="text-sm font-medium text-slate-700">Total Bills</span>
              </div>
              <span className="font-bold text-lg text-blue-600">{stats.bills}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
              <FiFileText className="text-white text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Quick Links</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/dashboard/agent")}
              className="w-full text-left p-4 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-all duration-200 flex items-center gap-3 border border-transparent hover:border-blue-200 hover:shadow-md"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUserCheck className="text-blue-600 text-lg" />
              </div>
              <span className="font-medium">Manage Agents</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/supplier")}
              className="w-full text-left p-4 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-all duration-200 flex items-center gap-3 border border-transparent hover:border-blue-200 hover:shadow-md"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiTruck className="text-blue-600 text-lg" />
              </div>
              <span className="font-medium">Manage Suppliers</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/contact")}
              className="w-full text-left p-4 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-all duration-200 flex items-center gap-3 border border-transparent hover:border-blue-200 hover:shadow-md"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiPhone className="text-blue-600 text-lg" />
              </div>
              <span className="font-medium">Manage Contacts</span>
            </button>
            <button
              onClick={() => navigate("/dashboard/bill")}
              className="w-full text-left p-4 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-all duration-200 flex items-center gap-3 border border-transparent hover:border-blue-200 hover:shadow-md"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiDollarSign className="text-blue-600 text-lg" />
              </div>
              <span className="font-medium">Manage Bills</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

