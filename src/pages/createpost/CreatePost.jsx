import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../slice/config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
import Sidebar from "../sidebar/sidebar";

const CreatePost = () => {
  const [posts, setPosts] = useState({ image: "", desc: "" });
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const handleInput = (e) => {
    let { name, value } = e.target;
    setPosts({ ...posts, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("User is not authenticated!");
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      const username = userDoc.exists() ? userDoc.data().username : "Anonymous";

      const postWithUserId = {
        ...posts,
        userId: currentUser.uid,
        timestamp: new Date(),
        username: username,
        profilePicURL: currentUser.photoURL || "/default-profile-pic.png",
      };

      if (editMode) {
        await updateDoc(doc(db, "post", editId), postWithUserId);
        console.log("Post updated!");
        setEditMode(false);
        setEditId(null);
      } else {
        await addDoc(collection(db, "post"), postWithUserId);
        console.log("Post created!");
      }

      setPosts({ image: "", desc: "" });
      getPosts(currentUser);
    } catch (error) {
      console.error("Error adding or updating document: ", error);
    }
  };

  const getPosts = async (user) => {
    if (!user) {
      console.error("User is not authenticated!");
      return;
    }

    try {
      setLoading(true);
      const q = query(collection(db, "post"), where("userId", "==", user.uid));
      let postsRef = await getDocs(q);

      let postData = await Promise.all(
        postsRef.docs.map(async (postDoc) => {
          const post = postDoc.data();
          const userDocRef = doc(db, "users", post.userId);
          const userDoc = await getDoc(userDocRef);
          const username = userDoc.exists()
            ? userDoc.data().username
            : "Anonymous";

          return {
            id: postDoc.id,
            ...post,
            username,
          };
        })
      );

      setAllPosts(postData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching documents: ", error);
      setLoading(false);
    }
  };

  const deletePosts = async (id) => {
    try {
      let postsDoc = doc(db, "post", id);
      await deleteDoc(postsDoc);
      setAllPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const startEdit = (post) => {
    setPosts({ image: post.image, desc: post.desc });
    setEditId(post.id);
    setEditMode(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        getPosts(user);
      } else {
        setAllPosts([]);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-100 min-h-screen">
      <div className="w-full lg:w-1/4 mb-4 lg:mb-0">
        <Sidebar />
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Create Post
        </h1>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto"
        >
          <input
            type="url"
            placeholder="Image URL"
            value={posts.image}
            name="image"
            onChange={handleInput}
            required
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <textarea
            placeholder="Description"
            value={posts.desc}
            name="desc"
            onChange={handleInput}
            required
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows="3"
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            {editMode ? "Update Post" : "Submit Post"}
          </button>
        </form>
        {loading ? (
          <div className="text-center mt-6">Loading...</div>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {allPosts.map((ele) => (
              <div
                key={ele.id}
                className="bg-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                <p className="font-semibold text-lg">{ele.username || "Anonymous"}</p>
                <p className="text-gray-700 mt-2">{ele.desc}</p>
                <img
                  src={ele.image}
                  alt="Post"
                  className="w-full h-auto rounded-lg mt-4 shadow-sm"
                />
                <div className="flex justify-between mt-4">
                  <button
                    className="flex items-center border border-red-600 text-red-600 p-2 rounded hover:bg-red-600 hover:text-white transition duration-200"
                    onClick={() => deletePosts(ele.id)}
                  >
                    <FaTrashAlt className="mr-1" />
                    Delete
                  </button>
                  <button
                    className="flex items-center border border-green-600 text-green-600 p-2 rounded hover:bg-green-600 hover:text-white transition duration-200"
                    onClick={() => startEdit(ele)}
                  >
                    <FaEdit className="mr-1" />
                    Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePost;
