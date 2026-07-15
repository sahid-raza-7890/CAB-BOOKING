import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import './Analytics.css';

const KPICard = ({ title, value, icon, trend, trendValue, subtitle }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {icon && <div className="kpi-icon">{icon}</div>}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-footer">
        {trend && (
          <div className={`kpi-trend ${trend}`}>
            {trend === 'up' && <ArrowUpRight size={16} />}
            {trend === 'down' && <ArrowDownRight size={16} />}
            {trend === 'neutral' && <Minus size={16} />}
            <span>{trendValue}</span>
          </div>
        )}
        {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export const KPICards = ({ data = [] }) => {
  return (
    <div className="kpi-grid">
      {data.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
};

export default KPICards;
