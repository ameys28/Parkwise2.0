import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

const cachedAuth = window.localStorage.getItem('parkwise.auth');
if (cachedAuth) {
  try {
    const parsed = JSON.parse(cachedAuth);
    if (parsed?.token) {
      setAuthToken(parsed.token);
    }
  } catch {
    window.localStorage.removeItem('parkwise.auth');
  }
}

const request = async (method, path, data = undefined, config = {}) => {
  const response = await apiClient.request({
    method,
    url: path,
    data,
    ...config,
  });
  return response.data;
};

/**
 * GET /vehicles
 * Returns all vehicles. Optionally filtered by ownerId query param.
 */
export const getVehicles = async (ownerId) => {
  try {
    const query = ownerId ? `?ownerId=${encodeURIComponent(ownerId)}` : '';
    return await request('get', `/vehicles${query}`);
  } catch (err) {
    console.warn('getVehicles failed, returning empty array:', err.message);
    return [];
  }
};

/**
 * POST /vehicles
 * Adds a new vehicle. Accepts { numberPlate, ownerId, guest }.
 */
export const addVehicle = async (vehicle) => {
  return request('post', '/vehicles', vehicle);
};

/**
 * GET /logs
 * Returns all parking logs sorted by timestamp descending.
 */
export const getLogs = async () => {
  try {
    return await request('get', '/logs');
  } catch (err) {
    console.warn('getLogs failed, returning empty array:', err.message);
    return [];
  }
};

/**
 * POST /logs
 * Adds a new parking log. Accepts { numberPlate, action } where action is "Entry" or "Exit".
 */
export const addLog = async (log) => {
  return request('post', '/logs', log);
};

/**
 * GET /occupancy
 * Returns current parking occupancy: { occupancy: N, totalSpots: 20 }.
 */
export const getOccupancy = async () => {
  try {
    return await request('get', '/occupancy');
  } catch (err) {
    console.warn('getOccupancy failed, returning default:', err.message);
    return { occupancy: 0, totalSpots: 20 };
  }
};

export const getSlots = async () => request('get', '/slots');
export const patchSlot = async (slotId, payload) => request('patch', `/slots/${slotId}`, payload);
export const createBooking = async (booking) => request('post', '/bookings', booking);
export const getBookings = async (params = {}) => {
  const search = new URLSearchParams(params).toString();
  return request('get', `/bookings${search ? `?${search}` : ''}`);
};
export const cancelBooking = async (bookingId) => request('delete', `/bookings/${bookingId}`);
export const registerAuth = async (payload) => request('post', '/auth/register', payload);
export const deleteVehicle = async (vehicleId) => request('delete', `/vehicles/${vehicleId}`);
