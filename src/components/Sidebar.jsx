import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiChevronDown, FiTruck, FiUserCheck, FiCircle, FiPhone, FiHome, FiFileText, FiList, FiDollarSign, FiUsers, FiClock, FiCreditCard, FiBell } from "react-icons/fi";
import { FiPlus } from "react-icons/fi";

const items = [
  {
    label: "Supplier",
    icon: FiTruck,
    children: [
      { label: "Add Supplier", to: "/dashboard/supplier", icon: FiPlus },
    ],
  },
  {
    label: "Agent",
    icon: FiUserCheck,
    children: [{ label: "Add Agent", to: "/dashboard/agent" }],
  },
  {
    label: "Contact",
    icon: FiPhone,
    children: [{ label: "Add Contact", to: "/dashboard/contact" }],
  },
  {
    label: "Party",
    icon: FiUsers,
    children: [{ label: "Add Party", to: "/dashboard/party" }],
  },
  {
    label: "Temp",
    icon: FiClock,
    children: [{ label: "Add Temp", to: "/dashboard/temp" }],
  },
  {
    label: "Payment",
    icon: FiCreditCard,
    children: [{ label: "Add Payment", to: "/dashboard/payment" }],
  },
  {
    label: "Payment Reminder",
    icon: FiBell,
    children: [{ label: "Add Reminder", to: "/dashboard/paymentreminder" }],
  },
  {
    label: "Bill",
    icon: FiFileText,
    children: [{ label: "Add Bill", to: "/dashboard/bill" }],
  },
  {
    label: "Transactions",
    icon: FiDollarSign,
    children: [{ label: "Add Transaction", to: "/dashboard/expense" }],
  },
  {
    label: "List / Table",
    icon: FiList,
    children: [{ label: "Manage APIs", to: "/dashboard/listtable" }],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openKey, setOpenKey] = useState("Supplier");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const isDashboard = pathname === "/dashboard" || pathname === "/dashboard/";

  useEffect(() => {
    if (pathname.includes("/supplier")) setOpenKey("Supplier");
    if (pathname.includes("/agent")) setOpenKey("Agent");
    if (pathname.includes("/contact")) setOpenKey("Contact");
    if (pathname.includes("/party")) setOpenKey("Party");
    if (pathname.includes("/temp")) setOpenKey("Temp");
    if (pathname.includes("/paymentreminder")) setOpenKey("Payment Reminder");
    if (pathname.includes("/payment")) setOpenKey("Payment");
    if (pathname.includes("/bill")) setOpenKey("Bill");
    if (pathname.includes("/expense")) setOpenKey("Transactions");
    if (pathname.includes("/listtable")) setOpenKey("List / Table");
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggle = (label) => setOpenKey((p) => (p === label ? null : label));

  const handleLinkClick = () => {
  
    if (isMobile && onClose) {
      onClose();
    }
  };

  const childCls = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <aside
      className={`h-full bg-white border-r border-slate-200 flex flex-col ${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 shadow-lg`}
    >
      <div className="flex items-center justify-center h-16 border-b border-slate-200">
        <h1 className={`font-semibold ${isOpen ? "text-xl" : "text-lg"}`}>
          {isOpen ? "HR Portal" : "HR"}
        </h1>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        <NavLink
          to="/dashboard"
          onClick={handleLinkClick}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors ${
              isActive || isDashboard
                ? "bg-blue-50 text-blue-600"
                : "text-slate-600 hover:bg-slate-100"
            }`
          }
        >
          <FiHome className="text-lg flex-shrink-0" />
          {isOpen && <span className="truncate">Dashboard</span>}
        </NavLink>

        {items.map((item) => {
          const Icon = item.icon;
          const isExpanded = openKey === item.label;

          return (
            <div key={item.label} className="space-y-1">
              {/* Parent */}
              <button
                type="button"
                onClick={() => toggle(item.label)}
                className={`w-full flex items-center gap-3 rounded-lg p-3 text-sm font-medium transition-colors ${isExpanded
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-100"
                  }`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className="text-lg flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    <FiChevronDown
                      className={`text-lg transition-transform ${isExpanded ? "rotate-180" : ""
                        }`}
                    />
                  </>
                )}
              </button>

              {/* Children */}
              {isOpen && isExpanded && (
                <div className="ml-11 space-y-1">
                  {item.children.map((c) => (
                    <NavLink 
                      key={c.label} 
                      to={c.to} 
                      className={childCls}
                      onClick={handleLinkClick}
                    >
                      <FiCircle className="text-[6px]" />
                      <span className="truncate">{c.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
// export default Sidebar;