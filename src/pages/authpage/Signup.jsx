import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { EmailLogin, GoogleAuth, auth, db } from "../../slice/config";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle Google Sign-In
  const signupWithGoogle = async () => {
    try {
      const res = await GoogleAuth();
      console.log(res);

      if (res) {
        // Google user data structure
        const googleUser = {
          uid: res.user.uid,
          username: res.user.displayName,
          email: res.user.email,
          password: "google-auth", // Use a placeholder for Google sign-in
          bio: "",
          profilePicURL: res.user.photoURL || "", // Get Google profile picture if available
          followers: [],
          following: [],
          createdAt: Date.now(),
        };

        // Save Google user data to Firestore
        await setDoc(doc(db, "users", res.user.uid), googleUser);

        // Dispatch user data to Redux store
        // dispatch(createUser(googleUser));

        // Save user data in localStorage
        localStorage.setItem("user", JSON.stringify(googleUser));

        // Navigate to the home page
        navigate("/");
      }
    } catch (error) {
      console.error("Error with Google Sign In: ", error);
    }
  };

  // Function to handle regular sign-up form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user; // Get user object

      // Prepare user data object
      const newUser = {
        uid: user.uid, // Get UID from user object
        username,
        email,
        password,
        bio: "",
        profilePicURL: "", // Placeholder for profile picture
        followers: [],
        following: [],
        createdAt: Date.now(),
      };

      // Save user data to Firestore with unique document ID
      await setDoc(doc(db, "users", user.uid), newUser);

      // Dispatch user data to Redux store
      // dispatch(createUser(newUser));

      // Save user data in localStorage
      localStorage.setItem("user", JSON.stringify(newUser));

      // Navigate to the home page after successful signup
      navigate(`/`);
    } catch (error) {
      console.error("Error with regular sign-up: ", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
      >
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
