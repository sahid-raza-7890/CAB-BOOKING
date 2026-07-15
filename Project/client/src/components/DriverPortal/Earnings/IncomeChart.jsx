import React from 'react';
import { useDriver } from '../DriverContext';

const IncomeChart = () => {
    const { earnings } = useDriver();

    const chartData = earnings?.week?.dailyTotals || [0, 0, 0, 0, 0, 0, 0];
    const maxVal = Math.max(...chartData, 1); // prevent division by zero

    return (
        <div className="earnings-card">
            <div className="card-header">
                <h3 className="card-title">Weekly Income Trend</h3>
                <div className="card-icon">
                    <i className="fas fa-chart-line"></i>
                </div>
            </div>
            
            <div className="chart-container">
                {chartData.map((val, index) => (
                    <div 
                        key={index}
                        className="chart-bar" 
                        style={{ height: `${(val / maxVal) * 100}%` }}
                        title={`₹${val}`}
                    ></div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#94a3b8', fontSize: '12px' }}>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
            </div>
        </div>
    );
};

export default IncomeChart;
