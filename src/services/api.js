const API_BASE_URL = 'http://159.89.139.254:3001/users';
const WORK_ORDER_API_URL = 'http://159.89.139.254:8000/api';

class ApiService {
  async request(endpoint, options = {}, baseUrl = API_BASE_URL) {
    const url = `${baseUrl}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      const textResponse = await response.text();
      console.log('📄 Response Text (primeros 200 chars):', textResponse.substring(0, 200));

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseError) {
        console.error('❌ JSON Parse Error. Response was:', textResponse);
        throw new Error('El servidor no devolvió un JSON válido');
      }

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Obtener TODOS los work orders (el filtrado se hace en el frontend)
  async getWorkOrders() {
    return this.request('/work-orders', {}, WORK_ORDER_API_URL);
  }
}

export default new ApiService();