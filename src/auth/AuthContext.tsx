import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { isCloudEnabled, supabase } from "../lib/supabase";

export type User = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isCloud: boolean;
  role: string | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (email: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hashLocal(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

type LocalUser = {
  id: string;
  email: string;
  passwordHash: string;
};

function getLocalUsers(): LocalUser[] {
  const stored = localStorage.getItem("dugout_users");
  return stored ? JSON.parse(stored) : [];
}

function saveLocalUsers(users: LocalUser[]) {
  localStorage.setItem("dugout_users", JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isCloudEnabled && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        const session = data.session;
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? ""
          });
        }
        setLoading(false);
      });

      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? ""
          });
        } else {
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }

    const stored = localStorage.getItem("dugout_current_user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser({ id: parsed.id, email: parsed.email });
        setRole(parsed.role ?? null);
      } catch {
        localStorage.removeItem("dugout_current_user");
      }
    }
    setLoading(false);
  }, []);

  const signup = async (email: string, password: string) => {
    if (isCloudEnabled && supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? email });
      }
      return;
    }

    const users = getLocalUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error("An account with this email already exists.");
    }

    const newUser: LocalUser = {
      id: crypto.randomUUID(),
      email,
      passwordHash: hashLocal(password)
    };
    users.push(newUser);
    saveLocalUsers(users);

    const sessionUser = { id: newUser.id, email: newUser.email };
    localStorage.setItem("dugout_current_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const login = async (email: string, password: string) => {
    if (isCloudEnabled && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? email });
      }
      return;
    }

    const users = getLocalUsers();
    const found = users.find((u) => u.email === email);
    if (!found) throw new Error("No account found for this email.");
    if (found.passwordHash !== hashLocal(password)) {
      throw new Error("Incorrect password.");
    }

    const sessionUser = { id: found.id, email: found.email };
    localStorage.setItem("dugout_current_user", JSON.stringify(sessionUser));
    setUser(sessionUser);
  };

  const resetPassword = async (email: string) => {
    if (isCloudEnabled && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      return;
    }
    throw new Error("Password reset is available after Supabase cloud authentication is connected.");
  };

  const updatePassword = async (password: string) => {
    if (isCloudEnabled && supabase) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return;
    }
    const stored = localStorage.getItem("dugout_current_user");
    if (!stored) throw new Error("No signed-in user found.");
    const current = JSON.parse(stored) as User;
    const users = getLocalUsers();
    const index = users.findIndex((u) => u.id === current.id);
    if (index < 0) throw new Error("Local account could not be found.");
    users[index].passwordHash = hashLocal(password);
    saveLocalUsers(users);
  };

  const demoLogin = async (email: string, roleName: string) => {
    const sessionUser = {
      id: crypto.randomUUID(),
      email,
      role: roleName
    };
    localStorage.setItem("dugout_current_user", JSON.stringify(sessionUser));
    setUser({ id: sessionUser.id, email: sessionUser.email });
    setRole(roleName);
  };

  const logout = async () => {
    if (isCloudEnabled && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem("dugout_current_user");
    }
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isCloud: isCloudEnabled,
        role,
        signup,
        login,
        demoLogin,
        logout,
        resetPassword,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
