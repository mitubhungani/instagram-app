import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import { db } from "../../slice/config";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaRegCommentAlt, FaRegHeart, FaHeart } from "react-icons/fa"; // Import both filled and unfilled heart icons

const Profilepage = () => {
  const [userData, setUserData] = useState({}); // State to store the user data
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0); // State to store the post count
  const [posts, setPosts] = useState([]); // State to store the user's posts
  const [isEditing, setIsEditing] = useState(false); // State to control edit mode
  const [newUsername, setNewUsername] = useState(""); // State for new username
  const [newProfilePicURL, setNewProfilePicURL] = useState(""); // State for new profile picture URL
  const auth = getAuth(); // Get the current authenticated user

  // Function to fetch user data from Firestore based on UID
  const fetchUserData = async (uid) => {
    try {
      const userDocRef = doc(db, "users", uid); // Reference to the user document
      const userDoc = await getDoc(userDocRef); // Get the user document

      if (userDoc.exists()) {
        setUserData(userDoc.data()); // Set the user's data
        setPostCount(userDoc.data().postCount || 0); // Get post count from user document
        setNewUsername(userDoc.data().username); // Initialize new username with current username
        setNewProfilePicURL(userDoc.data().profilePicURL || ""); // Initialize with current profile picture
      } else {
        console.log("No such user document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch posts
  const getPosts = async (uid) => {
    try {
      const q = query(collection(db, "post"), where("userId", "==", uid));
      const postsRef = await getDocs(q);
      const postData = postsRef.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        hasLiked: false, // Initialize with false to track like status
      }));

      setPosts(postData);
      setPostCount(postData.length); // Set the post count
      updatePostCount(uid, postData.length); // Update post count in Firestore
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Function to update post count in the Firestore database
  const updatePostCount = async (uid, count) => {
    try {
      const userDocRef = doc(db, "users", uid); // Reference to the user document
      await updateDoc(userDocRef, { postCount: count }); // Update the post count in Firestore
    } catch (error) {
      console.error("Error updating post count:", error);
    }
  };

  // Function to handle liking a post
  const handleLikeToggle = async (postId, currentLikes, hasLiked) => {
    try {
      const postRef = doc(db, "post", postId); // Reference to the post
      const newLikesCount = hasLiked ? currentLikes - 1 : currentLikes + 1; // Toggle likes based on current state
      await updateDoc(postRef, { likes: newLikesCount }); // Update likes in Firestore

      // Update the local state immediately for UI feedback
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: newLikesCount, hasLiked: !hasLiked }
            : post
        )
      );
    } catch (error) {
      console.error("Error updating likes:", error);
    }
  };

  // Function to handle profile update
  const handleUpdateProfile = async () => {
    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid); // Reference to the user's Firestore document

      // Update the user's document with the new username and profile picture URL
      await updateDoc(userDocRef, {
        username: newUsername,
        profilePicURL: newProfilePicURL,
      });

      // After successful update, fetch updated user data
      fetchUserData(auth.currentUser.uid);

      // Exit edit mode
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData(user.uid);
        getPosts(user.uid);
        setLoading(false);
      } else {
        console.log("No user authenticated.");
        setLoading(false);
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>; // Show loading message while fetching data
  }

  return (
    <div className="flex">
      <div className="w-1/4">
        <Sidebar />
      </div>
      <div className="bg-white w-full p-4">
        <div className="flex items-center mb-4">
          {/* Profile Picture */}
          <img
            src={userData.profilePicURL || "default_profile_pic_url"}
            alt="Profile"
            className="w-24 h-24 rounded-full border-2 border-gray-300"
          />
          <div className="ml-4">
            <h1 className="text-3xl font-bold">{userData.username}</h1>
            <div className="flex space-x-4 mt-2">
              <p>Followers: {userData.followers?.length || 0}</p>
              <p>Posts: {postCount}</p>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Edit Profile
        </button>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="mt-4">
            <h2 className="text-2xl font-semibold mb-2">Edit Profile</h2>
            <div className="flex flex-col mb-4">
              <label className="mb-1">Username:</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="border border-gray-300 rounded p-2"
              />
            </div>
            <div className="flex flex-col mb-4">
              <label className="mb-1">Profile Picture URL:</label>
              <input
                type="text"
                value={newProfilePicURL}
                onChange={(e) => setNewProfilePicURL(e.target.value)}
                className="border border-gray-300 rounded p-2"
              />
            </div>
            <button
              onClick={handleUpdateProfile}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Update Profile
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-md ml-2"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Posts Section */}
        <h2 className="text-2xl font-semibold mb-2">Posts</h2>
        <div className="grid grid-cols-3 gap-4">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id}>
                <img
                  src={post.image}
                  alt="User Post"
                  className="w-full h-auto rounded-lg object-cover"
                />
                <p className="my-3">{post.desc}</p>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center">
                    {/* Toggle like button */}
                    {post.hasLiked ? (
                      <FaHeart
                        className="text-xl text-red-500 cursor-pointer"
                        onClick={() =>
                          handleLikeToggle(post.id, post.likes, post.hasLiked)
                        }
                      />
                    ) : (
                      <FaRegHeart
                        className="text-xl cursor-pointer"
                        onClick={() =>
                          handleLikeToggle(post.id, post.likes, post.hasLiked)
                        }
                      />
                    )}
                    <span className="ml-2">{post.likes || 0} Likes</span>
                  </div>
                  <FaRegCommentAlt className="text-xl cursor-pointer" />
                </div>
              </div>
            ))
          ) : (
            <p>No posts available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profilepage;
