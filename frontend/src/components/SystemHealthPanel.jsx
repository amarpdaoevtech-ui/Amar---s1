import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../utils/ui-utils';

/**
 * SystemHealthPanel - Aggregated System State View
 * 
 * UX PRINCIPLE: Dashboards show SYSTEM STATE, not EVENT STREAMS
 * - Displays aggregate health metrics instead of raw alert events
 * - Shows fleet-wide status at a glance
 * - Eliminates alert fatigue through aggregation
 */
const SystemHealthPanel = ({ alerts, vehicles, onViewCritical }) => {
  // Aggregate alerts by severity
  const alertSummary = useMemo(() => {
    const critical = alerts.filter(a => a.severity === 'CRITICAL');
    const warning = alerts.filter(a => a.severity === 'WARNING');
    const total = alerts.length;

    // Group by vehicle for unique count
    const vehiclesWithCritical = new Set(critical.map(a => a.vehicle_id)).size;
    const vehiclesWithWarning = new Set(warning.map(a => a.vehicle_id)).size;

    // Calculate health score (0-100)
    const totalVehicles = Object.keys(vehicles).length;
    const healthyVehicles = totalVehicles - vehiclesWithCritical - vehiclesWithWarning;
    const healthScore = totalVehicles > 0 
      ? Math.round((healthyVehicles / totalVehicles) * 100) 
      : 100;

    // Trend calculation (mock - would use historical data in production)
    const trend = critical.length > 5 ? 'degrading' : critical.length > 0 ? 'stable' : 'improving';

    return {
      critical: { count: critical.length, vehicles: vehiclesWithCritical },
      warning: { count: warning.length, vehicles: vehiclesWithWarning },
      total,
      healthScore,
      trend,
      healthyVehicles
    };
  }, [alerts, vehicles]);

  // Determine overall system status
  const getSystemStatus = () => {
    if (alertSummary.critical.count > 0) {
      return { 
        label: 'DEGRADED', 
        color: 'text-ev-red', 
        bg: 'bg-ev-red/10',
        border: 'border-ev-red/30',
        icon: AlertCircle
      };
    }
    if (alertSummary.warning.count > 0) {
      return { 
        label: 'ATTENTION', 
        color: 'text-ev-yellow', 
        bg: 'bg-ev-yellow/10',
        border: 'border-ev-yellow/30',
        icon: AlertTriangle
      };
    }
    return { 
      label: 'NOMINAL', 
      color: 'text-ev-green', 
      bg: 'bg-ev-green/10',
      border: 'border-ev-green/30',
      icon: CheckCircle2
    };
  };

  const status = getSystemStatus();
  const StatusIcon = status.icon;

  return (
    <div className="glass-panel border-white/5 bg-white/[0.02] flex flex-col h-full">
      {/* Header - System Status */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            System Health
          </h3>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-black border",
            status.bg, status.color, status.border
          )}>
            <StatusIcon size={12} />
            {status.label}
          </div>
        </div>

        {/* Health Score */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl font-black",
                alertSummary.healthScore >= 90 ? "text-ev-green" :
                alertSummary.healthScore >= 70 ? "text-ev-yellow" : "text-ev-red"
              )}>
                {alertSummary.healthScore}%
              </span>
              <span className="text-[10px] text-slate-500 font-mono">HEALTH</span>
            </div>
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  alertSummary.healthScore >= 90 ? "bg-ev-green" :
                  alertSummary.healthScore >= 70 ? "bg-ev-yellow" : "bg-ev-red"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${alertSummary.healthScore}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          <TrendIndicator trend={alertSummary.trend} />
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Critical Card */}
        <AlertSummaryCard
          label="Critical"
          count={alertSummary.critical.count}
          vehicles={alertSummary.critical.vehicles}
          color="red"
          icon={AlertCircle}
          onClick={alertSummary.critical.count > 0 ? onViewCritical : undefined}
        />

        {/* Warning Card */}
        <AlertSummaryCard
          label="Warnings"
          count={alertSummary.warning.count}
          vehicles={alertSummary.warning.vehicles}
          color="yellow"
          icon={AlertTriangle}
        />
      </div>

      {/* Fleet Status */}
      <div className="px-4 pb-4 mt-auto">
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 font-mono uppercase">Fleet Status</span>
            <span className="text-slate-300 font-black">
              {alertSummary.healthyVehicles}/{Object.keys(vehicles).length} Healthy
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {Object.keys(vehicles).length > 0 && (
              <>
                <div 
                  className="h-1 bg-ev-green rounded-full"
                  style={{ width: `${(alertSummary.healthyVehicles / Object.keys(vehicles).length) * 100}%` }}
                />
                <div 
                  className="h-1 bg-ev-yellow rounded-full"
                  style={{ width: `${(alertSummary.warning.vehicles / Object.keys(vehicles).length) * 100}%` }}
                />
                <div 
                  className="h-1 bg-ev-red rounded-full"
                  style={{ width: `${(alertSummary.critical.vehicles / Object.keys(vehicles).length) * 100}%` }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Alert Summary Card Component
 */
const AlertSummaryCard = ({ label, count, vehicles, color, icon: Icon, onClick }) => {
  const colorClasses = {
    red: { bg: 'bg-ev-red/10', border: 'border-ev-red/30', text: 'text-ev-red', hover: 'hover:bg-ev-red/20' },
    yellow: { bg: 'bg-ev-yellow/10', border: 'border-ev-yellow/30', text: 'text-ev-yellow', hover: 'hover:bg-ev-yellow/20' },
  }[color];

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border transition-all",
        colorClasses.bg, colorClasses.border,
        onClick && `cursor-pointer ${colorClasses.hover}`
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-2xl font-black", colorClasses.text)}>
            {count}
          </p>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
            {label}
          </p>
        </div>
        <Icon size={16} className={colorClasses.text} />
      </div>
      {vehicles > 0 && (
        <p className="text-[9px] text-slate-400 mt-2 font-mono">
          {vehicles} vehicle{vehicles !== 1 ? 's' : ''} affected
        </p>
      )}
    </motion.div>
  );
};

/**
 * Trend Indicator Component
 */
const TrendIndicator = ({ trend }) => {
  const config = {
    improving: { icon: TrendingUp, color: 'text-ev-green', label: 'Improving' },
    stable: { icon: Minus, color: 'text-ev-blue', label: 'Stable' },
    degrading: { icon: TrendingDown, color: 'text-ev-red', label: 'Degrading' }
  }[trend];

  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-1">
      <Icon size={16} className={config.color} />
      <span className={cn("text-[8px] font-bold uppercase tracking-wider", config.color)}>
        {config.label}
      </span>
    </div>
  );
};

export default SystemHealthPanel;
