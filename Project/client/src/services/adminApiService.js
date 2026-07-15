/**
 * AdminApiService — UCAB Enterprise
 * Single communication layer for all Admin Portal API calls.
 *
 * Responsibilities:
 *  - Automatic Authorization header injection
 *  - Request deduplication (concurrent identical calls share one fetch)
 *  - In-memory caching with per-key TTLs
 *  - Cache invalidation (by key or pattern)
 *  - Unified error handling → structured { data, error, status }
 *  - Domain-specific helper methods
 *
 * No business logic lives here — communication only.
 */

const BASE_URL = 'http://localhost:5000';

// Cache TTL constants (ms)
const TTL = {
  DASHBOARD: 30_000,    // 30s — refreshed by socket events anyway
  RIDES:     10_000,    // 10s — dynamic
  RIDE:      15_000,    // 15s — individual ride
  DEFAULT:   20_000,
};

class AdminApiService {
  constructor() {
    /** @type {Map<string, {data: any, expiresAt: number}>} */
    this._cache = new Map();
    /** @type {Map<string, Promise<any>>} */
    this._inflight = new Map();
  }

  // ─── AUTH ─────────────────────────────────────────────────────────────────

  _headers(extra = {}) {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  }

  // ─── CACHE ────────────────────────────────────────────────────────────────

  _getCache(key) {
    const entry = this._cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { this._cache.delete(key); return null; }
    return entry.data;
  }

  _setCache(key, data, ttl = TTL.DEFAULT) {
    this._cache.set(key, { data, expiresAt: Date.now() + ttl });
  }

  invalidateGroup(groupName) {
    const prefix = `${groupName}:`;
    for (const k of this._cache.keys()) {
      if (k.startsWith(prefix)) {
        this._cache.delete(k);
      }
    }
    for (const k of this._inflight.keys()) {
      if (k.startsWith(prefix)) {
        this._inflight.delete(k);
      }
    }
  }

  clearCache() {
    this._cache.clear();
  }

  // ─── CORE FETCH ───────────────────────────────────────────────────────────

  /**
   * Fetch with deduplication and caching.
   * @param {string} path - relative to BASE_URL
   * @param {string|null} cacheKey - null = no cache
   * @param {number} ttl
   */
  async _get(path, cacheKey = null, ttl = TTL.DEFAULT) {
    // 1. Cache hit
    if (cacheKey) {
      const cached = this._getCache(cacheKey);
      if (cached !== null) {
        if (cached && cached.meta !== undefined) {
          return { data: cached.data, meta: cached.meta, error: null, status: 200 };
        }
        return { data: cached && cached.data !== undefined ? cached.data : cached, error: null, status: 200 };
      }
    }

    // 2. Deduplication — if an identical in-flight request exists, wait for it
    if (cacheKey && this._inflight.has(cacheKey)) {
      try {
        const json = await this._inflight.get(cacheKey);
        if (json && json.meta !== undefined) {
          return { data: json.data, meta: json.meta, error: null, status: 200 };
        }
        return { data: json && json.data !== undefined ? json.data : json, error: null, status: 200 };
      } catch (err) {
        return { data: null, error: err.message, status: 500 };
      }
    }

    // 3. Make the real request
    const promise = fetch(`${BASE_URL}${path}`, { headers: this._headers() })
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          throw Object.assign(new Error('Unauthorized'), { status: res.status });
        }
        const json = await res.json();
        if (!res.ok) throw Object.assign(new Error(json.message || 'Request failed'), { status: res.status });
        return json;
      });

    if (cacheKey) this._inflight.set(cacheKey, promise);

    try {
      const json = await promise;
      if (cacheKey) {
        this._setCache(cacheKey, json, ttl);
        this._inflight.delete(cacheKey);
      }
      if (json && json.meta !== undefined) {
        return { data: json.data, meta: json.meta, error: null, status: 200 };
      }
      return { data: json && json.data !== undefined ? json.data : json, error: null, status: 200 };
    } catch (err) {
      if (cacheKey) this._inflight.delete(cacheKey);
      return { data: null, error: err.message, status: err.status || 500 };
    }
  }

  async _post(path, body = {}) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw Object.assign(new Error(json.message || 'Request failed'), { status: res.status });
      if (json && json.meta !== undefined) {
        return { data: json.data, meta: json.meta, error: null, status: res.status };
      }
      return { data: json && json.data !== undefined ? json.data : json, error: null, status: res.status };
    } catch (err) {
      return { data: null, error: err.message, status: err.status || 500 };
    }
  }

  async _put(path, body = {}) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'PUT',
        headers: this._headers(),
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw Object.assign(new Error(json.message || 'Request failed'), { status: res.status });
      if (json && json.meta !== undefined) {
        return { data: json.data, meta: json.meta, error: null, status: res.status };
      }
      return { data: json && json.data !== undefined ? json.data : json, error: null, status: res.status };
    } catch (err) {
      return { data: null, error: err.message, status: err.status || 500 };
    }
  }

  // ─── DOMAIN METHODS — DASHBOARD ───────────────────────────────────────────

  getDashboard() {
    return this._get('/api/admin/dashboard', 'dashboard:global', TTL.DASHBOARD);
  }

  async refreshDashboard() {
    this.invalidateGroup('dashboard');
    return this.getDashboard();
  }

  // ─── DOMAIN METHODS — RIDES ───────────────────────────────────────────────

  /**
   * Get paginated + filtered ride list.
   * @param {object} filters - { status, search, from, to, page, limit, sort }
   */
  getRides(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) params.set(k, v); });
    const qs = params.toString();
    const key = `rides:list:${qs}`;
    return this._get(`/api/admin/rides${qs ? `?${qs}` : ''}`, key, TTL.RIDES);
  }

  getRide(id) {
    return this._get(`/api/admin/rides/${id}`, `rides:detail:${id}`, TTL.RIDE);
  }

  async assignDriver(rideId, driverId) {
    const result = await this._post(`/api/admin/rides/${rideId}/assign`, { driverId });
    this.invalidateGroup('rides');
    this.invalidateGroup('dashboard');
    return result;
  }

  async cancelRide(rideId, reason) {
    const result = await this._post(`/api/admin/rides/${rideId}/cancel`, { reason });
    this.invalidateGroup('rides');
    this.invalidateGroup('dashboard');
    return result;
  }

  async forceCompleteRide(rideId) {
    const result = await this._post(`/api/admin/rides/${rideId}/complete`);
    this.invalidateGroup('rides');
    this.invalidateGroup('dashboard');
    return result;
  }

  async triggerRefund(rideId, reason) {
    const result = await this._post(`/api/admin/rides/${rideId}/refund`, { reason });
    this.invalidateGroup('rides');
    this.invalidateGroup('dashboard');
    return result;
  }

  // ─── DOMAIN METHODS — DRIVERS ─────────────────────────────────────────────

  getDrivers(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) params.set(k, v); });
    const qs = params.toString();
    const key = `drivers:list:${qs}`;
    return this._get(`/api/admin/drivers${qs ? `?${qs}` : ''}`, key, TTL.DEFAULT);
  }

  getDriver(id) {
    return this._get(`/api/admin/drivers/${id}`, `drivers:detail:${id}`, TTL.DEFAULT);
  }

  async verifyDriver(id) {
    const result = await this._put(`/api/admin/drivers/${id}/verify`);
    this.invalidateGroup('drivers');
    this.invalidateGroup('dashboard');
    return result;
  }

  async suspendDriver(id) {
    const result = await this._put(`/api/admin/drivers/${id}/suspend`);
    this.invalidateGroup('drivers');
    this.invalidateGroup('dashboard');
    return result;
  }

  async reactivateDriver(id) {
    const result = await this._put(`/api/admin/drivers/${id}/reactivate`);
    this.invalidateGroup('drivers');
    this.invalidateGroup('dashboard');
    return result;
  }

  getDriverDocuments(id) {
    return this._get(`/api/admin/drivers/${id}/documents`, `drivers:documents:${id}`, TTL.DEFAULT);
  }

  getDriverVehicles(id) {
    return this._get(`/api/admin/drivers/${id}/vehicles`, `drivers:vehicles:${id}`, TTL.DEFAULT);
  }

  getDriverEarnings(id) {
    return this._get(`/api/admin/drivers/${id}/earnings`, `drivers:earnings:${id}`, TTL.DEFAULT);
  }

  getDriverHistory(id) {
    return this._get(`/api/admin/drivers/${id}/history`, `drivers:history:${id}`, TTL.DEFAULT);
  }

  // ─── DOMAIN METHODS — USERS (Sprint 24) ───────────────────────────────────

  getUsers(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) params.set(k, v); });
    const qs = params.toString();
    const key = `users:list:${qs}`;
    return this._get(`/api/admin/users${qs ? `?${qs}` : ''}`, key, TTL.DEFAULT);
  }

  getUser(id) {
    return this._get(`/api/admin/users/${id}`, `users:detail:${id}`, TTL.DEFAULT);
  }

  async suspendUser(id) {
    const result = await this._put(`/api/admin/users/${id}/suspend`);
    this.invalidateGroup('users');
    this.invalidateGroup('dashboard');
    return result;
  }

  async reactivateUser(id) {
    const result = await this._put(`/api/admin/users/${id}/reactivate`);
    this.invalidateGroup('users');
    this.invalidateGroup('dashboard');
    return result;
  }

  async updateUserStatus(id, status) {
    const result = await this._put(`/api/admin/users/${id}/status`, { status });
    this.invalidateGroup('users');
    this.invalidateGroup('dashboard');
    return result;
  }

  getUserRideHistory(id) {
    return this._get(`/api/admin/users/${id}/rides`, `users:detail:rides:${id}`, TTL.DEFAULT);
  }

  getUserWallet(id) {
    return this._get(`/api/admin/users/${id}/wallet`, `users:detail:wallet:${id}`, TTL.DEFAULT);
  }

  getUserPayments(id) {
    return this._get(`/api/admin/users/${id}/payments`, `users:detail:payments:${id}`, TTL.DEFAULT);
  }

  // ─── DOMAIN METHODS — COMPLIANCE (Sprint 25) ──────────────────────────────

  getPendingDocuments() {
    return this._get('/api/admin/compliance/documents', 'compliance:documents:pending', TTL.DEFAULT);
  }

  getDriverDocuments(driverId) {
    return this._get(`/api/admin/compliance/documents/${driverId}`, `compliance:documents:driver:${driverId}`, TTL.DEFAULT);
  }

  async approveDocument(id, expiryDate, remarks) {
    const result = await this._put(`/api/admin/compliance/documents/${id}/approve`, { expiryDate, remarks });
    this.invalidateGroup('compliance');
    this.invalidateGroup('dashboard');
    return result;
  }

  async rejectDocument(id, reason) {
    const result = await this._put(`/api/admin/compliance/documents/${id}/reject`, { reason });
    this.invalidateGroup('compliance');
    this.invalidateGroup('dashboard');
    return result;
  }

  getPendingVehicles() {
    return this._get('/api/admin/compliance/vehicles', 'compliance:vehicles:pending', TTL.DEFAULT);
  }

  getDriverVehicles(driverId) {
    return this._get(`/api/admin/compliance/vehicles/${driverId}`, `compliance:vehicles:driver:${driverId}`, TTL.DEFAULT);
  }

  async approveVehicle(id, remarks) {
    const result = await this._put(`/api/admin/compliance/vehicles/${id}/approve`, { remarks });
    this.invalidateGroup('compliance');
    this.invalidateGroup('dashboard');
    return result;
  }

  async rejectVehicle(id, reason) {
    const result = await this._put(`/api/admin/compliance/vehicles/${id}/reject`, { reason });
    this.invalidateGroup('compliance');
    this.invalidateGroup('dashboard');
    return result;
  }

  // ─── DOMAIN METHODS — FINANCE (Sprint 26) ─────────────────────────────────

  getFinanceDashboard() {
    return this._get('/api/admin/finance/dashboard', 'finance:dashboard', TTL.DEFAULT);
  }

  getPayments(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) params.set(k, v); });
    const qs = params.toString();
    return this._get(`/api/admin/finance/payments${qs ? `?${qs}` : ''}`, `payments:list:${qs}`, TTL.DEFAULT);
  }

  getPayment(id) {
    return this._get(`/api/admin/finance/payments/${id}`, `payments:detail:${id}`, TTL.DEFAULT);
  }

  async refundPayment(id, remarks) {
    const result = await this._post(`/api/admin/finance/payments/${id}/refund`, { remarks });
    this.invalidateGroup('finance');
    this.invalidateGroup('payments');
    this.invalidateGroup('dashboard');
    return result;
  }

  async retryPayment(id) {
    const result = await this._post(`/api/admin/finance/payments/${id}/retry`);
    this.invalidateGroup('finance');
    this.invalidateGroup('payments');
    this.invalidateGroup('dashboard');
    return result;
  }

  getPassengerWallets(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) params.set(k, v); });
    const qs = params.toString();
    return this._get(`/api/admin/finance/passenger-wallets${qs ? `?${qs}` : ''}`, `wallets:passenger:${qs}`, TTL.DEFAULT);
  }

  getDriverWallets(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) params.set(k, v); });
    const qs = params.toString();
    return this._get(`/api/admin/finance/driver-wallets${qs ? `?${qs}` : ''}`, `wallets:driver:${qs}`, TTL.DEFAULT);
  }

  async adjustWallet(id, payload) {
    const result = await this._put(`/api/admin/finance/wallet/${id}/adjust`, payload);
    this.invalidateGroup('finance');
    this.invalidateGroup('wallets');
    this.invalidateGroup('dashboard');
    return result;
  }

  getTransactions(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) params.set(k, v); });
    const qs = params.toString();
    return this._get(`/api/admin/finance/transactions${qs ? `?${qs}` : ''}`, `wallets:transactions:${qs}`, TTL.DEFAULT);
  }

  getSettlements() {
    return this._get('/api/admin/finance/settlements', 'settlements:list', TTL.DEFAULT);
  }

  async releaseSettlement(id) {
    const result = await this._post(`/api/admin/finance/settlements/${id}/release`);
    this.invalidateGroup('finance');
    this.invalidateGroup('settlements');
    this.invalidateGroup('dashboard');
    return result;
  }

  getDriverEarnings() {
    return this._get('/api/admin/finance/earnings', 'finance:earnings', TTL.DEFAULT);
  }

  getCommissionReport() {
    return this._get('/api/admin/finance/commissions', 'finance:commissions', TTL.DEFAULT);
  }

  // ─── DOMAIN METHODS — PROMOTIONS (Sprint 27) ──────────────────────────────

  getPromotionDashboard() {
    return this._get('/api/admin/promotions/dashboard', 'promotions:dashboard', TTL.DEFAULT);
  }

  getPromotions() {
    return this._get('/api/admin/promotions', 'promotions:list', TTL.DEFAULT);
  }

  getPromotion(id) {
    return this._get(`/api/admin/promotions/${id}`, `promotions:detail:${id}`, TTL.DEFAULT);
  }

  async createPromotion(data) {
    const result = await this._post('/api/admin/promotions', data);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async updatePromotion(id, data) {
    const result = await this._put(`/api/admin/promotions/${id}`, data);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async deletePromotion(id) {
    const result = await this._delete(`/api/admin/promotions/${id}`);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async activatePromotion(id) {
    const result = await this._put(`/api/admin/promotions/${id}/activate`);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async deactivatePromotion(id) {
    const result = await this._put(`/api/admin/promotions/${id}/deactivate`);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  getCoupons() {
    return this._get('/api/admin/promotions/coupons', 'promotions:coupons:list', TTL.DEFAULT);
  }

  async createCoupon(data) {
    const result = await this._post('/api/admin/promotions/coupons', data);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async updateCoupon(id, data) {
    const result = await this._put(`/api/admin/promotions/coupons/${id}`, data);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async deleteCoupon(id) {
    const result = await this._delete(`/api/admin/promotions/coupons/${id}`);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  getReferralPrograms() {
    return this._get('/api/admin/promotions/referrals', 'promotions:referrals:list', TTL.DEFAULT);
  }

  async createReferralProgram(data) {
    const result = await this._post('/api/admin/promotions/referrals', data);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async updateReferralProgram(id, data) {
    const result = await this._put(`/api/admin/promotions/referrals/${id}`, data);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  getDriverIncentives() {
    return this._get('/api/admin/promotions/incentives', 'promotions:incentives:list', TTL.DEFAULT);
  }

  async createDriverIncentive(data) {
    const result = await this._post('/api/admin/promotions/incentives', data);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async updateDriverIncentive(id, data) {
    const result = await this._put(`/api/admin/promotions/incentives/${id}`, data);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async enableDriverIncentive(id) {
    const result = await this._put(`/api/admin/promotions/incentives/${id}/enable`);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  async disableDriverIncentive(id) {
    const result = await this._put(`/api/admin/promotions/incentives/${id}/disable`);
    this.invalidateGroup('promotions');
    this.invalidateGroup('dashboard');
    return result;
  }

  getCampaignAnalytics() {
    return this._get('/api/admin/promotions/analytics', 'promotions:analytics', TTL.DEFAULT);
  }

  // ─── DOMAIN METHODS — SAFETY & SUPPORT (Sprint 28) ───────────────────────

  getSafetyDashboard() {
    return this._get('/api/admin/safety/dashboard', 'safety:dashboard', TTL.DEFAULT);
  }

  getSafetyAlerts() {
    return this._get('/api/admin/safety/alerts', 'safety:alerts:list', TTL.DEFAULT);
  }

  getSafetyAlert(id) {
    return this._get(`/api/admin/safety/alerts/${id}`, `safety:alerts:detail:${id}`, TTL.DEFAULT);
  }

  async resolveSafetyAlert(id, remarks) {
    const result = await this._put(`/api/admin/safety/alerts/${id}/resolve`, { remarks });
    this.invalidateGroup('safety');
    this.invalidateGroup('dashboard');
    return result;
  }

  async escalateSafetyAlert(id, remarks) {
    const result = await this._put(`/api/admin/safety/alerts/${id}/escalate`, { remarks });
    this.invalidateGroup('safety');
    this.invalidateGroup('dashboard');
    return result;
  }

  async dismissSafetyAlert(id, remarks) {
    const result = await this._put(`/api/admin/safety/alerts/${id}/dismiss`, { remarks });
    this.invalidateGroup('safety');
    this.invalidateGroup('dashboard');
    return result;
  }

  getSupportTickets() {
    return this._get('/api/admin/safety/tickets', 'safety:tickets:list', TTL.DEFAULT);
  }

  getSupportTicket(id) {
    return this._get(`/api/admin/safety/tickets/${id}`, `safety:tickets:detail:${id}`, TTL.DEFAULT);
  }

  async assignSupportTicket(id) {
    const result = await this._put(`/api/admin/safety/tickets/${id}/assign`);
    this.invalidateGroup('safety');
    this.invalidateGroup('dashboard');
    return result;
  }

  async replySupportTicket(id, message) {
    const result = await this._post(`/api/admin/safety/tickets/${id}/reply`, { message });
    this.invalidateGroup('safety');
    this.invalidateGroup('dashboard');
    return result;
  }

  async closeSupportTicket(id) {
    const result = await this._put(`/api/admin/safety/tickets/${id}/close`);
    this.invalidateGroup('safety');
    this.invalidateGroup('dashboard');
    return result;
  }

  async reopenSupportTicket(id) {
    const result = await this._put(`/api/admin/safety/tickets/${id}/reopen`);
    this.invalidateGroup('safety');
    this.invalidateGroup('dashboard');
    return result;
  }

  getSupportAnalytics() {
    return this._get('/api/admin/safety/analytics', 'safety:analytics', TTL.DEFAULT);
  }

  // ─── ADMIN ANALYTICS (Sprint 29) ────────────────────────────────────────

  getAnalyticsDashboard() {
    return this._get('/api/admin/analytics/dashboard', 'analytics:dashboard', TTL.DEFAULT);
  }

  getRevenueAnalytics() {
    return this._get('/api/admin/analytics/revenue', 'analytics:revenue', TTL.DEFAULT);
  }

  getRideAnalytics() {
    return this._get('/api/admin/analytics/rides', 'analytics:rides', TTL.DEFAULT);
  }

  getDriverAnalytics() {
    return this._get('/api/admin/analytics/drivers', 'analytics:drivers', TTL.DEFAULT);
  }

  getPassengerAnalytics() {
    return this._get('/api/admin/analytics/passengers', 'analytics:passengers', TTL.DEFAULT);
  }

  getFinancialAnalytics() {
    return this._get('/api/admin/analytics/finance', 'analytics:finance', TTL.DEFAULT);
  }

  getPromotionAnalytics() {
    return this._get('/api/admin/analytics/promotions', 'analytics:promotions', TTL.DEFAULT);
  }

  getSafetyAnalytics() {
    return this._get('/api/admin/analytics/safety', 'analytics:safety', TTL.DEFAULT);
  }

  getGeographicalAnalytics() {
    return this._get('/api/admin/analytics/geography', 'analytics:geography', TTL.DEFAULT);
  }

  getPlatformKPIs() {
    return this._get('/api/admin/analytics/kpis', 'analytics:kpis', TTL.DEFAULT);
  }

  async exportAnalytics(filters, reportType) {
    const result = await this._post('/api/admin/analytics/export', { filters, reportType });
    this.invalidateGroup('analytics');
    this.invalidateGroup('dashboard');
    return result;
  }

  // ─── PLATFORM SETTINGS & CONFIGURATION (Sprint 30) ─────────────────────────

  getSettings() {
    return this._get('/api/admin/settings', 'settings:all', TTL.DEFAULT);
  }

  getCategorySettings(category) {
    return this._get(`/api/admin/settings/${category}`, `settings:category:${category}`, TTL.DEFAULT);
  }

  async updateSetting(key, value) {
    const result = await this._put(`/api/admin/settings/${key}`, { value });
    this.invalidateGroup('settings');
    this.invalidateGroup('dashboard');
    return result;
  }

  async bulkUpdateSettings(updates) {
    const result = await this._put('/api/admin/settings', { updates });
    this.invalidateGroup('settings');
    this.invalidateGroup('dashboard');
    return result;
  }

  async resetCategory(category) {
    const result = await this._post(`/api/admin/settings/reset/${category}`);
    this.invalidateGroup('settings');
    this.invalidateGroup('dashboard');
    return result;
  }

  async resetAllSettings() {
    const result = await this._post('/api/admin/settings/reset');
    this.invalidateGroup('settings');
    this.invalidateGroup('dashboard');
    return result;
  }

  // ─── NOTIFICATION & COMMUNICATION CENTER (Sprint 31) ─────────────────────

  getNotificationDashboard() {
    return this._get('/api/admin/notifications/dashboard', 'notifications:dashboard', TTL.DEFAULT);
  }

  getNotifications(params) {
    const qs = new URLSearchParams(params).toString();
    return this._get(`/api/admin/notifications?${qs}`, `notifications:list:${qs}`, TTL.DEFAULT);
  }

  getNotification(id) {
    return this._get(`/api/admin/notifications/${id}`, `notifications:${id}`, TTL.DEFAULT);
  }

  async createNotification(payload) {
    const result = await this._post('/api/admin/notifications', payload);
    this.invalidateGroup('notifications');
    this.invalidateGroup('dashboard');
    return result;
  }

  async updateNotification(id, payload) {
    const result = await this._put(`/api/admin/notifications/${id}`, payload);
    this.invalidateGroup('notifications');
    this.invalidateGroup('dashboard');
    return result;
  }

  async deleteNotification(id) {
    const result = await this._delete(`/api/admin/notifications/${id}`);
    this.invalidateGroup('notifications');
    this.invalidateGroup('dashboard');
    return result;
  }

  async sendBroadcast(payload) {
    const result = await this._post('/api/admin/notifications/broadcast', payload);
    this.invalidateGroup('notifications');
    this.invalidateGroup('dashboard');
    return result;
  }

  async sendDrivers(payload) {
    const result = await this._post('/api/admin/notifications/drivers', payload);
    this.invalidateGroup('notifications');
    this.invalidateGroup('dashboard');
    return result;
  }

  async sendPassengers(payload) {
    const result = await this._post('/api/admin/notifications/passengers', payload);
    this.invalidateGroup('notifications');
    this.invalidateGroup('dashboard');
    return result;
  }

  async scheduleNotification(payload) {
    const result = await this._post('/api/admin/notifications/schedule', payload);
    this.invalidateGroup('notifications');
    this.invalidateGroup('dashboard');
    return result;
  }

  async cancelSchedule(id) {
    const result = await this._post(`/api/admin/notifications/schedule/${id}/cancel`);
    this.invalidateGroup('notifications');
    this.invalidateGroup('dashboard');
    return result;
  }

  getTemplates() {
    return this._get('/api/admin/notifications/templates', 'notifications:templates', TTL.DEFAULT);
  }

  async createTemplate(payload) {
    const result = await this._post('/api/admin/notifications/templates', payload);
    this.invalidateGroup('notifications');
    return result;
  }

  async updateTemplate(id, payload) {
    const result = await this._put(`/api/admin/notifications/templates/${id}`, payload);
    this.invalidateGroup('notifications');
    return result;
  }

  async deleteTemplate(id) {
    const result = await this._delete(`/api/admin/notifications/templates/${id}`);
    this.invalidateGroup('notifications');
    return result;
  }

  // ─── RBAC & PERMISSION MANAGEMENT (Sprint 32) ─────────────────────────────

  getRoles() {
    return this._get('/api/admin/roles', 'roles:all', TTL.DEFAULT);
  }

  getRole(id) {
    return this._get(`/api/admin/roles/${id}`, `roles:${id}`, TTL.DEFAULT);
  }

  async createRole(payload) {
    const result = await this._post('/api/admin/roles', payload);
    this.invalidateGroup('roles');
    this.invalidateGroup('dashboard');
    return result;
  }

  async updateRole(id, payload) {
    const result = await this._put(`/api/admin/roles/${id}`, payload);
    this.invalidateGroup('roles');
    this.invalidateGroup('dashboard');
    return result;
  }

  async deleteRole(id) {
    const result = await this._delete(`/api/admin/roles/${id}`);
    this.invalidateGroup('roles');
    this.invalidateGroup('dashboard');
    return result;
  }

  async assignRole(id, userId) {
    const result = await this._post(`/api/admin/roles/${id}/assign`, { userId });
    this.invalidateGroup('roles');
    this.invalidateGroup('users');
    this.invalidateGroup('dashboard');
    return result;
  }

  async removeRole(id, userId) {
    const result = await this._post(`/api/admin/roles/${id}/remove`, { userId });
    this.invalidateGroup('roles');
    this.invalidateGroup('users');
    this.invalidateGroup('dashboard');
    return result;
  }

  getPermissions() {
    return this._get('/api/admin/roles/permissions', 'permissions:all', TTL.DEFAULT);
  }

  // ─── AUDIT CENTER (Sprint 33) ─────────────────────────────────────────────

  getAuditDashboard() {
    return this._get('/api/admin/audit/dashboard', 'audit:dashboard', TTL.SHORT);
  }

  getAudits(params) {
    const qs = new URLSearchParams(params).toString();
    return this._get(`/api/admin/audit?${qs}`, `audit:list:${qs}`, TTL.SHORT);
  }

  getAudit(id) {
    return this._get(`/api/admin/audit/${id}`, `audit:${id}`, TTL.DEFAULT);
  }

  searchAudits(query) {
    return this._get(`/api/admin/audit/search?q=${encodeURIComponent(query)}`, `audit:search:${query}`, TTL.SHORT);
  }

  getAuditAnalytics() {
    return this._get('/api/admin/audit/analytics', 'audit:analytics', TTL.SHORT);
  }

  getAuditTimeline(params) {
    const qs = new URLSearchParams(params).toString();
    return this._get(`/api/admin/audit/timeline?${qs}`, `audit:timeline:${qs}`, TTL.SHORT);
  }

  exportAudits(params) {
    const qs = new URLSearchParams(params).toString();
    return this._get(`/api/admin/audit/export?${qs}`, `audit:export:${qs}`, TTL.SHORT);
  }

  // ─── LIVE OPERATIONS & COMMAND CENTER (Sprint 34) ────────────────────────

  getOperationsDashboard() {
    return this._get('/api/admin/operations/dashboard', 'operations:dashboard', TTL.NONE);
  }

  getLiveMap() {
    return this._get('/api/admin/operations/map', 'operations:map', TTL.NONE);
  }

  getActiveRides() {
    return this._get('/api/admin/operations/rides', 'operations:rides', TTL.NONE);
  }

  getOnlineDrivers() {
    return this._get('/api/admin/operations/drivers', 'operations:drivers', TTL.NONE);
  }

  getWaitingPassengers() {
    return this._get('/api/admin/operations/passengers', 'operations:passengers', TTL.NONE);
  }

  getDispatchQueue() {
    return this._get('/api/admin/operations/dispatch', 'operations:dispatch', TTL.NONE);
  }

  getSurgeZones() {
    return this._get('/api/admin/operations/surge', 'operations:surge', TTL.NONE);
  }

  getSOSAlerts() {
    return this._get('/api/admin/operations/sos', 'operations:sos', TTL.NONE);
  }

  getSupportQueue() {
    return this._get('/api/admin/operations/support', 'operations:support', TTL.NONE);
  }

  getSystemHealth() {
    return this._get('/api/admin/operations/system', 'operations:system', TTL.NONE);
  }

  getOperationsMetrics() {
    return this._get('/api/admin/operations/metrics', 'operations:metrics', TTL.NONE);
  }

  // ─── DOMAIN METHODS — SYSTEM (Sprint 37) ─────────────────────────────────

  getSystemStatus() {
    return this._get('/api/admin/system/status', 'system:status', 5000);
  }

  getLogs(limit = 100) {
    return this._get(`/api/admin/system/logs?limit=${limit}`, 'system:logs', 5000);
  }

  createBackup() {
    return this._post('/api/admin/system/backups');
  }

  restoreBackup(backupId) {
    return this._post(`/api/admin/system/backups/${backupId}/restore`);
  }

  getSystemSecurity() {
    return this._get('/api/admin/system/security', 'system:security', 10000);
  }

  getBackups() {
    return this._get('/api/admin/system/backups', 'system:backups', 10000);
  }
}

// Singleton export
const adminApiService = new AdminApiService();
export default adminApiService;
