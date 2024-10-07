import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/authpage/Login";
import Signup from "../pages/authpage/Signup";
import PrivetRoutes from "../components/Private";
import CreatePost from "../pages/createpost/CreatePost";
import Home from "../pages/homepage/Home";
import Profilepage from "../pages/profile/Profilepage";

const Allroutes = () => {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <PrivetRoutes>
              <Home />
            </PrivetRoutes>
          }
        ></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route
          path="/createpost/:id"
          element={
            <PrivetRoutes>
              <CreatePost />
            </PrivetRoutes>
          }
        ></Route>
        <Route
          path="/profile/:id"
          element={
            <PrivetRoutes>
              <Profilepage />
            </PrivetRoutes>
          }
        ></Route>
      </Routes>
    </div>
  );
};

export default Allroutes;
