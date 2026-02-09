import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, ResponsiveContainer, Tooltip 
} from 'recharts';
import { AlertCircle, AlertTriangle, Info, TrendingUp, Zap, Battery, Thermometer, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { cn } from '../utils/ui-utils';
import { formatRelativeTime } from '../utils/formatters';

/**
 * AlertOverviewWidgets - Central Dashboard Widgets for Alert Aggregation
 * 
 * Shows:
 * 1. Alerts by severity (donut chart)
 * 2. Alerts by type (bar chart)
 * 3. Alerts/min trend (line indicator)
 */
const AlertOverviewWidgets = ({ alerts, className }) => {
  const [alertStats, setAlertStats] = useState({
    bySeverity: [],
    byType: [],
    trend: 0
  });

  // Fetch aggregated stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [severityRes, typeRes] = await Promise.all([
          axios.get('/api/v1/alerts/stats/by-severity'),
          axios.get('/api/v1/alerts/stats/by-type')
        ]);
        
        setAlertStats(prev => ({
          ...prev,
          bySeverity: severityRes.data.data || [],
          byType: typeRes.data.data || []
        }));
      } catch (error) {
        console.error('Failed to fetch alert stats:', error);
      }
    };

    fetchStats();
    
    // Poll every 5 seconds for updates
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate trend (alerts per minute - last 10 minutes)
  const alertTrend = useMemo(() => {
    if (alerts.length === 0) return { rate: 0, status: 'stable' };
    
    // Count alerts in last 10 minutes
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const recentAlerts = alerts.filter(a => new Date(a.created_at) > tenMinutesAgo);
    const rate = Math.round((recentAlerts.length / 10) * 60); // alerts per minute
    
    // Determine trend status
    let status = 'stable';
    if (rate > 500) status = 'critical';
    else if (rate > 300) status = 'warning';
    else if (rate > 100) status = 'attention';
    
    return { rate, status };
  }, [alerts]);

  // Get icon for alert type
  const getAlertTypeIcon = (type) => {
    if (type?.includes('battery') || type?.includes('soc')) return Battery;
    if (type?.includes('temp') || type?.includes('heat')) return Thermometer;
    if (type?.includes('voltage') || type?.includes('current')) return Zap;
    return AlertCircle;
  };

  // Severity colors
  const severityColors = {
    CRITICAL: '#ff4d4d',
    WARNING: '#ffcc00',
    INFO: '#00d2ff'
  };

  const severityBgColors = {
    CRITICAL: 'bg-ev-red/10',
    WARNING: 'bg-ev-yellow/10',
    INFO: 'bg-ev-blue/10'
  };

  const severityBorderColors = {
    CRITICAL: 'border-ev-red/30',
    WARNING: 'border-ev-yellow/30',
    INFO: 'border-ev-blue/30'
  };

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      {/* Alerts by Severity - Donut Chart */}
      <div className="glass-panel p-6 border-white/5 bg-white/[0.02]">
        <WidgetHeader 
          title="Alerts by Severity" 
          icon={<AlertCircle size={16} />}
          value={alerts.length}
          label="Total Active"
        />
        
        <div className="h-48 mt-4">
          {alertStats.bySeverity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertStats.bySeverity}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="severity"
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  {alertStats.bySeverity.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={severityColors[entry.severity] || '#00d2ff'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  content={<CustomTooltip />} 
                  formatter={(value) => [value, 'Alerts']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <CheckCircle2 size={32} className="text-ev-green mb-2 opacity-50" />
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                No Active Alerts
              </p>
            </div>
          )}
        </div>

        {/* Severity Legend */}
        <div className="mt-4 space-y-2">
          {alertStats.bySeverity.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: severityColors[item.severity] }}
                />
                <span className="text-xs text-slate-300">{item.severity}</span>
              </div>
              <span className="text-sm font-black text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts by Type - Bar Chart */}
      <div className="glass-panel p-6 border-white/5 bg-white/[0.02]">
        <WidgetHeader 
          title="Alerts by Type" 
          icon={<Zap size={16} />}
          value={alertStats.byType.length}
          label="Categories"
        />
        
        <div className="h-48 mt-4">
          {alertStats.byType.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertStats.byType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="alert_type" 
                  type="category" 
                  width={80}
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  radius={[0, 4, 4, 0]}
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  {alertStats.byType.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={severityColors[entry.highest_severity] || '#00d2ff'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Info size={32} className="text-ev-blue mb-2 opacity-50" />
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                No Alert Types
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alerts/Min Trend - Metric Card */}
      <div className="glass-panel p-6 border-white/5 bg-white/[0.02]">
        <WidgetHeader 
          title="Alert Rate" 
          icon={<TrendingUp size={16} />}
        />
        
        <div className="flex flex-col items-center justify-center h-48">
          <motion.div
            className={cn(
              "text-5xl font-black mb-2",
              alertTrend.status === 'critical' ? "text-ev-red" :
              alertTrend.status === 'warning' ? "text-ev-yellow" :
              alertTrend.status === 'attention' ? "text-ev-blue" : "text-ev-green"
            )}
            animate={{ scale: alertTrend.rate > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ 
              duration: 2, 
              repeat: alertTrend.rate > 0 ? Infinity : 0,
              repeatType: "reverse"
            }}
          >
            {alertTrend.rate}
          </motion.div>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-6">
            Alerts per Minute
          </p>
          
          {/* Status Indicator */}
          <div className={cn(
            "px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider",
            alertTrend.status === 'critical' ? "bg-ev-red/20 border-ev-red/50 text-ev-red" :
            alertTrend.status === 'warning' ? "bg-ev-yellow/20 border-ev-yellow/50 text-ev-yellow" :
            alertTrend.status === 'attention' ? "bg-ev-blue/20 border-ev-blue/50 text-ev-blue" :
            "bg-ev-green/20 border-ev-green/50 text-ev-green"
          )}>
            {alertTrend.status.toUpperCase()}
          </div>
        </div>

        {/* Trend Visualization */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] mb-2">
            <span className="text-slate-500">Recent Activity</span>
            <span className="text-slate-300 font-mono">
              Last 10 min
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className={cn(
                "h-full rounded-full",
                alertTrend.status === 'critical' ? "bg-ev-red" :
                alertTrend.status === 'warning' ? "bg-ev-yellow" :
                alertTrend.status === 'attention' ? "bg-ev-blue" : "bg-ev-green"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((alertTrend.rate / 500) * 100, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const WidgetHeader = ({ title, icon, value, label }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded bg-white/5">
        {icon}
      </div>
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
        {title}
      </h3>
    </div>
    {value !== undefined && (
      <div className="text-right">
        <div className="text-lg font-black text-white">{value}</div>
        <div className="text-[8px] text-slate-500 uppercase tracking-wider">{label}</div>
      </div>
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-white/10 p-3 rounded shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-slate-500 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs font-black" style={{ color: entry.color }}>
            {entry.name || entry.dataKey}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default AlertOverviewWidgets;