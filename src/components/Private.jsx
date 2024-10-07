import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PrivetRoutes = ({ children }) => {
  const isLogin = useSelector((store) => store.users.isLogin);

  const locaUser = JSON.parse(localStorage.getItem("user"));

  if (isLogin || locaUser !== null) {
    console.log("user is not logged in");
    return children;
  } else {
    console.log("user is logged in");
    return <Navigate to="/login" />;
  }
};

export default PrivetRoutes;
