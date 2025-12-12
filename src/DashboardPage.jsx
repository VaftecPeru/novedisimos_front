import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FaCalendarAlt, FaCaretUp, FaCaretDown } from "react-icons/fa";
import "./DashboardPage.css";

const DashboardPage = () => {
    const today = new Date().toISOString().slice(0, 10);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const [dates, setDates] = useState({ start: oneWeekAgo, end: today });
    const [activeTab, setActiveTab] = useState(0);
    const [allData, setAllData] = useState({});
    const [summaries, setSummaries] = useState([]);
    const [reload, setReload] = useState(0);
    const [loading, setLoading] = useState(false);

    const metricConfigs = [
        { api_name: "total_sales_over_time", title: "Ventas totales", color: "#008060", type: "sum", unit: "money" },
        { api_name: "sessions_over_time", title: "Sesiones", color: "#005bd3", type: "sum", unit: "count" },
        { api_name: "orders_over_time", title: "Pedidos", color: "#4a4a4a", type: "sum", unit: "count" },
        { api_name: "conversion_rate_over_time", title: "Tasa de conversión", color: "#963800", type: "avg", unit: "percent" },
        { api_name: "returns_over_time", title: "Devoluciones", color: "#d72c0d", type: "sum", unit: "count" },
        { api_name: "returning_customer_rate", title: "Tasa de clientes recurrentes", color: "#008060", type: "avg", unit: "percent" },
        { api_name: "return_rate_over_time", title: "Tasa de devoluciones", color: "#d72c0d", type: "avg", unit: "percent" },
        { api_name: "aov_over_time", title: "Valor promedio de pedido", color: "#005bd3", type: "avg", unit: "money" },
        { api_name: "gross_sales_over_time", title: "Ventas brutas", color: "#4a4a4a", type: "sum", unit: "money" },
    ];

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            const prevDates = getPreviousPeriod(dates.start, dates.end);
            const promises = metricConfigs.map(async (config) => {
                const [curr, prev] = await Promise.all([
                    fetchMetric(config.api_name, dates.start, dates.end),
                    fetchMetric(config.api_name, prevDates.start, prevDates.end),
                ]);
                return { [config.api_name]: { current: curr, previous: prev } };
            });
            const results = await Promise.all(promises);
            const newAllData = Object.assign({}, ...results);
            setAllData(newAllData);

            const newSummaries = metricConfigs.map((config) => {
                const data = newAllData[config.api_name];
                if (!data || !data.current || !data.current.rows || !data.current.columns || data.current.columns.length < 2) {
                    return { value: "Cargando...", trend: "0%", isUp: true };
                }
                const valueKey = data.current.columns[1].name;
                const currValues = data.current.rows.map((r) => parseFloat(r[valueKey] || 0));
                const prevValues = data.previous.rows.map((r) => parseFloat(r[valueKey] || 0));
                const currVal = computeAggregate(currValues, config.type);
                const prevVal = computeAggregate(prevValues, config.type);
                let trendVal = 0;
                if (prevVal !== 0) trendVal = ((currVal - prevVal) / prevVal) * 100;
                const trend = `${trendVal > 0 ? "+" : ""}${trendVal.toFixed(2)}%`;
                const isUp = trendVal >= 0;
                const value = formatValue(currVal, config.unit);
                return { value, trend, isUp };
            });
            setSummaries(newSummaries);
            setLoading(false);
        };
        fetchAll();
    }, [reload]);

    const getPreviousPeriod = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diff = endDate.getTime() - startDate.getTime();
        const prevEndDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        const prevStartDate = new Date(prevEndDate.getTime() - diff);
        return {
            start: prevStartDate.toISOString().slice(0, 10),
            end: prevEndDate.toISOString().slice(0, 10),
        };
    };

    const fetchMetric = async (metric, start, end) => {
        const url = `https://psicologosenlima.com/shopify/public/api/analytics/metric?metric=${metric}&start=${start}&end=${end}`;
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error(error);
            return { rows: [], columns: [] };
        }
    };

    const computeAggregate = (values, type) => {
        if (values.length === 0) return 0;
        const sum = values.reduce((a, b) => a + b, 0);
        return type === "sum" ? sum : sum / values.length;
    };

    const formatValue = (val, unit) => {
        const roundedVal = parseFloat(val.toFixed(2));
        if (unit === "money") return `S/ ${roundedVal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (unit === "percent") return `${roundedVal.toFixed(2)}%`;
        if (unit === "count") return roundedVal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return roundedVal.toString();
    };

    const activeConfig = metricConfigs[activeTab];
    const activeData = allData[activeConfig?.api_name]?.current || { rows: [], columns: [] };
    const chartData = activeData.rows;
    const dataKey = activeData.columns[1]?.name || "";

    const valuesForChart = chartData.map((r) => parseFloat(r[dataKey] || 0));
    const maxValue = Math.max(...valuesForChart, 1);

    return (
        <div className="dashboard">
            <div className="filter-section">
                <div className="date-picker">
                    <FaCalendarAlt />
                    <input type="date" value={dates.start} onChange={(e) => setDates({ ...dates, start: e.target.value })} />
                    <span>—</span>
                    <input type="date" value={dates.end} onChange={(e) => setDates({ ...dates, end: e.target.value })} />
                    <button className="btn-load" onClick={() => setReload(reload + 1)} disabled={loading}>
                        {loading ? "Cargando..." : "Cargar"}
                    </button>
                </div>
            </div>

            <div className="metrics-grid">
                {metricConfigs.map((m, idx) => (
                    <div
                        key={idx}
                        className={`metric-item ${activeTab === idx ? "active" : ""}`}
                        onClick={() => setActiveTab(idx)}
                        style={activeTab === idx ? { borderBottom: `3px solid ${m.color}` } : {}}
                    >
                        <p className="metric-title">{m.title}</p>
                        <div className="metric-value-row">
                            <span className="metric-value">{summaries[idx]?.value || "Cargando..."}</span>
                            <span className={`metric-trend ${summaries[idx]?.isUp ? "up" : "down"}`}>
                                {summaries[idx]?.isUp ? <FaCaretUp /> : <FaCaretDown />} {summaries[idx]?.trend || "0%"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="main-chart-display">
                <div className="chart-info">
                    <h3>{metricConfigs[activeTab].title} en el tiempo</h3>
                    <p>Mostrando datos desde {dates.start} hasta {dates.end}</p>
                </div>
                <div className="responsive-chart">
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={metricConfigs[activeTab].color} stopOpacity={0.1} />
                                    <stop offset="95%" stopColor={metricConfigs[activeTab].color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "#6d7175", fontSize: 12 }}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return `${date.getDate()} ${date.toLocaleString("es-ES", { month: "short" })}`;
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                domain={[0, Math.ceil(maxValue * 1.1 * 100) / 100]} // redondeado a 2 decimales
                                tick={{ fill: "#6d7175", fontSize: 12 }}
                                tickFormatter={(value) => {
                                    const unit = metricConfigs[activeTab].unit;
                                    const rounded = parseFloat(value.toFixed(2));
                                    if (unit === "money") return `S/ ${rounded.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                    if (unit === "percent") return `${rounded.toFixed(2)}%`;
                                    return rounded.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                }}
                            />
                            <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                            <Area
                                type="monotone"
                                dataKey={dataKey}
                                stroke={metricConfigs[activeTab].color}
                                fillOpacity={1}
                                fill="url(#colorMetric)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
