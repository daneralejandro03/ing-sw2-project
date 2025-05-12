import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(loginSuccess({ token }));
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
