const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create an axios-like API object for consistency
const api = {
  get: async (url) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return { data };
  },
  
  post: async (url, body) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return { data };
  },
  
  put: async (url, body) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return { data };
  },
  
  patch: async (url, body) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return { data };
  },
  
  delete: async (url) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });
    const data = await response.json();
    if (!response.ok) throw { response: { data } };
    return { data };
  }
};

export default api;
export { API_URL };
