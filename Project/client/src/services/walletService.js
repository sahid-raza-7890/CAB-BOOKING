export const getWalletBalance = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch('http://localhost:5000/api/wallet/balance', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch wallet balance');
    return await response.json();
};

export const getWalletTransactions = async (page = 1, limit = 20) => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch(`http://localhost:5000/api/wallet/transactions?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
};

export const addMoney = async (amount) => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch('http://localhost:5000/api/wallet/add-money', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ amount })
    });
    if (!response.ok) throw new Error('Failed to add money');
    return await response.json();
};
