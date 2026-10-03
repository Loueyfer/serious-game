import * as SecureStore from "expo-secure-store";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
  User,
} from "../services/api";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  login: (
    username: string,
    password: string
  ) => Promise<void>;

  register: (
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const TOKEN_KEY = "auth_token";

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedToken = await SecureStore.getItemAsync(
        TOKEN_KEY
      );

      if (!storedToken) {
        return;
      }

      const currentUser =
        await getCurrentUser(storedToken);

      setToken(storedToken);
      setUser(currentUser);
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(
    username: string,
    password: string
  ) {
    const data = await loginUser(username, password);

    await SecureStore.setItemAsync(
      TOKEN_KEY,
      data.token
    );

    setToken(data.token);
    setUser(data.user);
  }

  async function register(
    username: string,
    password: string
  ) {
    await registerUser(username, password);

    // Automatically log in after registration
    await login(username, password);
  }

  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}