import React from "react";
import "./DashboardPage.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { FaCalendarDay, FaCalendarMinus, FaCalendarAlt, FaCalendarCheck, FaChartBar } from "react-icons/fa";
import { FaShoppingCart, FaClock, FaBox, FaTruck } from "react-icons/fa";

const DashboardPage = () => {
    const statsTop = [
        { title: "Pedidos de hoy", amount: "$2169.85", details: "Efectivo: $2169.85", color: "#10B981", icon: <FaCalendarDay /> },
        { title: "Pedidos de ayer", amount: "$732.35", details: "Efectivo: $732.35", color: "#F97316", icon: <FaCalendarMinus /> },
        { title: "Este mes", amount: "$5708.93", details: "", color: "#3B82F6", icon: <FaCalendarAlt /> },
        { title: "Mes pasado", amount: "$182709.65", details: "", color: "#0EA5E9", icon: <FaCalendarCheck /> },
        { title: "Ventas de todos los tiempos", amount: "$819882.80", details: "", color: "#059669", icon: <FaChartBar /> },
    ];

    const statsMiddle = [
        { title: "Pedido total", value: 1007, icon: <FaShoppingCart /> },
        { title: "Pedidos pendientes", value: 314, icon: <FaClock /> },
        { title: "Procesamiento de pedidos", value: 141, icon: <FaBox /> },
        { title: "Pedidos entregados", value: 442, icon: <FaTruck /> },
    ];

    const lineData = [
        { name: "", Sales: 700 },
        { name: "13-06", Sales: 2200 },
        { name: "14-06", Sales: 1500 },
        { name: "15-06", Sales: 3000 },
        { name: "16-06", Sales: 2000 },
        { name: "17-06", Sales: 2780 },
        { name: "18-06", Sales: 1890 },
        { name: "19-06", Sales: 2390 },
        { name: "20-06", Sales: 3490 },
    ];

    const pieData = [
        { name: "Mint", value: 400 },
        { name: "Lettuce", value: 500 },
        { name: "Organic", value: 300 },
        { name: "Sweet Corn", value: 350 },
    ];

    const COLORS = ["#10B981", "#3B82F6", "#F97316", "#6366F1"];

    return (
        <div className="dashboard">
            <h2 className="title">Descripción general del panel de control</h2>

            <div className="top-cards">
                {statsTop.map((item, idx) => (
                    <div key={idx} className="card" style={{ backgroundColor: item.color }}>
                        <div className="card-header">
                            <h4>{item.title}</h4>
                            <span className="icon-top">{item.icon}</span>
                        </div>
                        <h3>{item.amount}</h3>
                        <p>{item.details}</p>
                    </div>
                ))}
            </div>

            <div className="middle-cards">
                {statsMiddle.map((item, idx) => (
                    <div key={idx} className="card small">
                        <h4><span className="icon-middle">{item.icon}</span> {item.title}</h4>
                        <h2 style={{ color: item.color || "#111" }}>{item.value}</h2>
                        {item.extra && <p style={{ color: "red" }}>( {item.extra} )</p>}
                    </div>
                ))}
            </div>

            <div className="charts-section">
                <div className="chart-card">
                    <h4>Ventas semanales 2025</h4>
                    <LineChart width={350} height={200} data={lineData}>
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="Sales" stroke="#10B981" />
                    </LineChart>
                </div>

                <div className="chart-card">
                    <h4>Productos más vendidos</h4>
                    <PieChart width={350} height={200}>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                            {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, auto)",
                                rowGap: "8px",
                                columnGap: "20px"
                            }}
                        />
                    </PieChart>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
