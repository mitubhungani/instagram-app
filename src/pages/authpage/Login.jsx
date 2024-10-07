import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuth } from "../../slice/config";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase Auth

const Signin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase Auth

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const signupWithGoogle = async () => {
    try {
      const res = await GoogleAuth();
      console.log(res);

      // If Google Sign In is successful, create user data object
      if (res) {
        const googleUser = {
          // username: res.user.displayName,
          uid: res.user.uid,
          email: res.user.email,
        };

        // Dispatch createUser action to store Google user data in backend
        // dispatch(loginUser(googleUser));

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(googleUser));

        // Navigate to the home page
        navigate("/");
      }
    } catch (error) {
      console.error("Error with Google Sign In: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = {
      username,
      password,
    };

    // Use Firebase Auth to sign in
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        username,
        password
      );
      const userData = userCredential.user;

      // If successful, navigate to the home page
      if (userData) {
        // Create a user object to store
        const loggedInUser = {
          username: userData.displayName || username, // Assuming you have displayName in user data
          email: userData.email,
          password: password,
        };

        // dispatch(loginUser(loggedInUser));
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        navigate("/"); // Redirect to home page
      }
    } catch (error) {
      console.error("Error signing in: ", error);
      alert("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Submit
        </button>
        <div className="mt-4 text-center">
          <button
            onClick={signupWithGoogle}
            className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-300 mt-4"
          >
            Sign in with Google
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signin;
