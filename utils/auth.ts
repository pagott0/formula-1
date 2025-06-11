interface AuthData {
  token?: string;
  user?: {
    id: string;
    username: string;
    user_type: string;
    name: string;
    user_type: "admin" | "team" | "driver";
    constructor_id?: number | null;
    driver_id?: number| null;
  };
  refreshToken?: string;
  expiresAt?: number;
}

class AuthStorage {
  private static readonly AUTH_KEY = 'auth_data';

  // Create/Update auth data
  static setAuth(authData: AuthData): void {
    try {
      localStorage.setItem(this.AUTH_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  // Read auth data
  static getAuth(): AuthData | null {
    try {
      const data = localStorage.getItem(this.AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve auth data:', error);
      return null;
    }
  }

  // Update specific auth fields
  static updateAuth(updates: Partial<AuthData>): void {
    const currentAuth = this.getAuth();
    if (currentAuth) {
      this.setAuth({ ...currentAuth, ...updates });
    }
  }

  // Delete auth data
  static clearAuth(): void {
    try {
      localStorage.removeItem(this.AUTH_KEY);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const auth = this.getAuth();
    if (!auth?.token) return false;
    
    if (auth.expiresAt && auth.expiresAt < Date.now()) {
      this.clearAuth();
      return false;
    }
    
    return true;
  }

  // Get token
  static getToken(): string | null {
    const auth = this.getAuth();
    return auth?.token || null;
  }

  // Get user data
  static getUser(): AuthData['user'] | null {
    const auth = this.getAuth();
    return auth?.user || null;
  }

  // Get constructor name
  static getConstructorName(): string | null {
    const user = this.getUser();
    return user?.name?.toLowerCase() || null;
  }
}

export default AuthStorage;