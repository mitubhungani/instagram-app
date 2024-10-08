import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"; // Added arrayRemove for comment deletion
import { db } from "../../slice/config";
import RightSidebar from "../sidebar/RightSidebar";
import {
  FaRegCommentAlt,
  FaRegHeart,
  FaHeart,
  FaTrashAlt,
} from "react-icons/fa"; // Added FaTrashAlt for delete icon
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [users, setUsers] = useState({});

  const getUsers = async () => {
    const userQuery = query(collection(db, "users"));
    const userSnapshot = await getDocs(userQuery);
    const userData = {};
    userSnapshot.docs.forEach((doc) => {
      userData[doc.id] = {
        username: doc.data().username,
        profilePicURL: doc.data().profilePicURL,
      };
    });
    setUsers(userData);
  };

  const getPosts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "post"));
      const postsRef = await getDocs(q);
      const postData = postsRef.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts: ", error);
      setLoading(false);
    }
  };

  const handleLikeToggle = async (postId, currentLikes, likedBy) => {
    try {
      const postRef = doc(db, "post", postId);
      const hasLiked = likedBy.includes(currentUser);
      let newLikesCount, updatedLikedBy;

      if (hasLiked) {
        newLikesCount = currentLikes - 1;
        updatedLikedBy = likedBy.filter((user) => user !== currentUser);
      } else {
        newLikesCount = currentLikes + 1;
        updatedLikedBy = [...likedBy, currentUser];
      }

      await updateDoc(postRef, {
        likes: newLikesCount,
        likedBy: updatedLikedBy,
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, likes: newLikesCount, likedBy: updatedLikedBy }
            : post
        )
      );
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  const handleCommentChange = (e, postId) => {
    setCommentText({ ...commentText, [postId]: e.target.value });
  };

  const handleAddComment = async (postId, currentComments) => {
    try {
      const comment = {
        text: commentText[postId],
        commentedBy: currentUser,
        timestamp: new Date(),
      };

      const postRef = doc(db, "post", postId);
      await updateDoc(postRef, { comments: arrayUnion(comment) });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...(post.comments || []), comment] }
            : post
        )
      );

      setCommentText({ ...commentText, [postId]: "" });
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  // Function to delete a comment
  const handleDeleteComment = async (postId, comment) => {
    try {
      const postRef = doc(db, "post", postId);

      // Update Firestore by removing the comment
      await updateDoc(postRef, { comments: arrayRemove(comment) });

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: post.comments.filter(
                  (c) => c.timestamp !== comment.timestamp
                ), // Filter out deleted comment
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error deleting comment: ", error);
    }
  };

  const handleShowCommentsToggle = (postId) => {
    setShowComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
        getPosts();
        getUsers();
      } else {
        console.log("No authenticated user.");
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600">
          Loading posts...
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between">
      <div className="w-1/5">
        <Sidebar />
      </div>
      <div className="w-3/5 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">All Posts</h1>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="w-1/2 p-4 mx-auto">
              <div className="flex items-center mb-2">
                <img
                  className="rounded-full w-8 mr-2"
                  src={
                    users[post.userId]?.profilePicURL ||
                    "/default-profile-pic.png"
                  }
                  alt="Profile Pic"
                />
                <p className="text-sm text-gray-500 cursor-pointer">
                  {users[post.userId]?.username || "Unknown User"}
                </p>
              </div>
              <hr />
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full object-cover my-4"
                />
              )}
              <hr />
              <p className="text-gray-700 font-medium my-2">{post.desc}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {post.likedBy && post.likedBy.includes(currentUser) ? (
                    <FaHeart
                      className="text-xl cursor-pointer text-red-500"
                      onClick={() =>
                        handleLikeToggle(
                          post.id,
                          post.likes || 0,
                          post.likedBy || []
                        )
                      }
                    />
                  ) : (
                    <FaRegHeart
                      className="text-xl cursor-pointer"
                      onClick={() =>
                        handleLikeToggle(
                          post.id,
                          post.likes || 0,
                          post.likedBy || []
                        )
                      }
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-600">
                    {post.likes || 0} {post.likes === 1 ? "Like" : "Likes"}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaRegCommentAlt
                    className="text-xl cursor-pointer"
                    onClick={() => handleShowCommentsToggle(post.id)}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {post.comments ? post.comments.length : 0}{" "}
                    {post.comments && post.comments.length === 1
                      ? "Comment"
                      : "Comments"}
                  </span>
                </div>
              </div>

              {showComments[post.id] && (
                <div className="mt-4">
                  {post.comments && post.comments.length > 0 && (
                    <div className="space-y-2">
                      {post.comments.map((comment, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <img
                            className="rounded-full w-6"
                            src={
                              users[comment.commentedBy]?.profilePicURL ||
                              "/default-profile-pic.png"
                            }
                            alt="Commenter Pic"
                          />
                          <div>
                            <p className="text-sm font-semibold">
                              {users[comment.commentedBy]?.username ||
                                "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-600">
                              {comment.text}
                            </p>
                          </div>
                          {comment.commentedBy === currentUser && (
                            <FaTrashAlt
                              className="text-red-500 cursor-pointer"
                              onClick={() =>
                                handleDeleteComment(post.id, comment)
                              }
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center mt-4">
                    <input
                      type="text"
                      className="border border-gray-300 rounded-l-md px-4 py-2 w-full"
                      placeholder="Add a comment..."
                      value={commentText[post.id] || ""}
                      onChange={(e) => handleCommentChange(e, post.id)}
                    />
                    <button
                      onClick={() =>
                        handleAddComment(post.id, post.comments || [])
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="w-1/5">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
