import React from "react";
import "./DashboardPage.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { FaCalendarDay, FaCalendarMinus, FaCalendarAlt, FaCalendarCheck, FaChartBar } from "react-icons/fa";
import { FaShoppingCart, FaClock, FaBox, FaTruck } from "react-icons/fa";

const DashboardPage = () => {
    const statsTop = [
        { icon: <FaCalendarDay />, title: "Pedidos de hoy", amount: "S/ 0.00", details: { cash: "S/ 24.90", card: "S/ 162.70", credit: "S/ 50.10" }, color: "#0f9d8a" },
        { icon: <FaCalendarMinus />, title: "Pedidos de ayer", amount: "S/ 429.58", details: { cash: "S/ 429.58", card: "S/ 232.60", credit: "S/ 79.80" }, color: "#f97316" },
        { icon: <FaCalendarAlt />, title: "Este mes",amount: "S/ 9227.46", details: null, color: "#3b82f6" },
        { icon: <FaCalendarCheck />, title: "Ultimo mes", amount: "S/ 182709.65", details: null, color: "#0ea5e9" },
        { icon: <FaChartBar />, title: "Venatas totales", amount: "S/ 820546.16", details: null, color: "#059669" },
    ];

    const statsMiddle = [
        { title: "Pedido total", value: 1007, icon: <FaShoppingCart /> },
        { title: "Pedidos pendientes", value: 314, icon: <FaClock /> },
        { title: "Procesamiento de pedidos", value: 141, icon: <FaBox /> },
        { title: "Pedidos entregados", value: 442, icon: <FaTruck /> },
    ];

    const lineData = [
        { name: "", Ventas: 700 },
        { name: "13-06", Ventas: 2200 },
        { name: "18-06", Ventas: 1500 },
        { name: "23-06", Ventas: 3000 },
        { name: "28-06", Ventas: 2000 },
        { name: "03-07", Ventas: 2780 },
        { name: "08-07", Ventas: 1890 },
        { name: "13-07", Ventas: 2390 },
        { name: "18-07", Ventas: 3490 },
    ];

    const pieData = [
        { name: "Ropa", value: 500 },
        { name: "Calzado", value: 400 },
        { name: "Accesorios", value: 350 },
        { name: "Electrónica", value: 300 },
    ];

    const COLORS = ["#10B981", "#3B82F6", "#F97316", "#6366F1"];

    return (
        <div className="dashboard">
            <h2 className="title">Descripción general del panel de control</h2>

            <div className="top-cards">
                {statsTop.map((item, idx) => (
                    <div key={idx} className="top-card" style={{ backgroundColor: item.color }}>
                        <div className="icon">{item.icon}</div>
                        <h4>{item.title}</h4>
                        <h2>{item.amount}</h2>
                        {item.details && (
                            <div className="details">
                                <p>Efectivo : {item.details.cash}</p>
                                <p>Tarjeta : {item.details.card}</p>
                                <p>Credito : {item.details.credit}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="middle-cards">
                {statsMiddle.map((item, idx) => (
                    <div key={idx} className="card small">
                        <div className="card-content">
                            <div className="icon-middle">{item.icon}</div>
                            <div className="text-content">
                                <h4>{item.title}</h4>
                                <h2>{item.value}</h2>
                                {item.extra && <p style={{ color: "red" }}>( {item.extra} )</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="charts-section">
                <div className="chart-card">
                    <h4>Ventas semanales 2025</h4>
                    <LineChart width={500} height={250} data={lineData} margin={{ top: 5, right: 5, left: 0, bottom: 15 }}>
                        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="Ventas" stroke="#10B981" />
                    </LineChart>
                </div>

                <div className="chart-card">
                    <h4>Productos más vendidos</h4>
                    <PieChart width={500} height={250}>
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
