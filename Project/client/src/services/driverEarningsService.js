export const fetchEarningsSummary = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const res = await fetch('http://localhost:5000/api/driver/earnings/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch summary');
    return await res.json();
};

export const fetchEarningsHistory = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const res = await fetch('http://localhost:5000/api/driver/earnings/history', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch history');
    const response = await res.json();
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
};

export const fetchSettlements = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const res = await fetch('http://localhost:5000/api/driver/settlements', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch settlements');
    const response = await res.json();
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
};

export const fetchIncentives = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const res = await fetch('http://localhost:5000/api/driver/incentives/active', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch incentives');
    const response = await res.json();
    const data = response.data?.data ?? response.data ?? [];
    return Array.isArray(data) ? data : [];
};
