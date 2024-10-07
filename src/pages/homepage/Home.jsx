// import React, { useEffect, useState } from "react";
// import Sidebar from "../sidebar/sidebar";
// import { collection, getDocs, query, updateDoc, doc, arrayUnion } from "firebase/firestore"; // Firestore functions
// import { db } from "../../slice/config"; // Firestore instance
// import RightSidebar from "../sidebar/RightSidebar";
// import { FaRegCommentAlt, FaRegHeart, FaHeart } from "react-icons/fa"; // Icons
// import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase auth to get UID

// const Home = () => {
//   const [posts, setPosts] = useState([]); // Store posts
//   const [loading, setLoading] = useState(true); // Track loading state
//   const [currentUser, setCurrentUser] = useState(null); // Store current user UID
//   const [commentText, setCommentText] = useState({}); // Store comment input for each post
//   const [showComments, setShowComments] = useState({}); // Track visibility of comments for each post
//   const [users, setUsers] = useState({}); // Store usernames and profile pictures of users

//   // Function to fetch all users with their usernames and profile pictures
//   const getUsers = async () => {
//     const userQuery = query(collection(db, "users")); // Adjust collection name as needed
//     const userSnapshot = await getDocs(userQuery);
//     const userData = {};
//     userSnapshot.docs.forEach((doc) => {
//       userData[doc.id] = {
//         username: doc.data().username,
//         profilePicURL: doc.data().profilePicURL, // Assuming profilePicURL is stored under 'profilePicURL' field
//       };
//     });
//     setUsers(userData); // Set usernames and profile pictures
//   };

//   // Function to fetch all posts
//   const getPosts = async () => {
//     try {
//       setLoading(true);

//       // Query to get posts from Firestore
//       const q = query(collection(db, "post"));
//       const postsRef = await getDocs(q);
//       const postData = postsRef.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));

//       setPosts(postData); // Set posts after fetching
//       setLoading(false); // Stop loading
//     } catch (error) {
//       console.error("Error fetching posts: ", error);
//       setLoading(false); // Stop loading if error occurs
//     }
//   };

//   // Function to toggle like/unlike a post
//   const handleLikeToggle = async (postId, currentLikes, likedBy) => {
//     try {
//       const postRef = doc(db, "post", postId); // Get post reference
//       const hasLiked = likedBy.includes(currentUser); // Check if current user has liked the post
//       let newLikesCount, updatedLikedBy;

//       if (hasLiked) {
//         newLikesCount = currentLikes - 1;
//         updatedLikedBy = likedBy.filter((user) => user !== currentUser); // Remove user from likedBy list
//       } else {
//         newLikesCount = currentLikes + 1;
//         updatedLikedBy = [...likedBy, currentUser]; // Add user to likedBy list
//       }

//       // Update likes in Firestore
//       await updateDoc(postRef, { likes: newLikesCount, likedBy: updatedLikedBy });

//       // Update local state
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post.id === postId ? { ...post, likes: newLikesCount, likedBy: updatedLikedBy } : post
//         )
//       );
//     } catch (error) {
//       console.error("Error updating likes: ", error);
//     }
//   };

//   // Function to handle comment input
//   const handleCommentChange = (e, postId) => {
//     setCommentText({ ...commentText, [postId]: e.target.value }); // Update comment input for the specific post
//   };

//   // Function to add a comment to a post
//   const handleAddComment = async (postId, currentComments) => {
//     try {
//       const comment = {
//         text: commentText[postId], // Get the comment text for the specific post
//         commentedBy: currentUser, // The current user's UID
//         timestamp: new Date(), // The current timestamp
//       };

//       const postRef = doc(db, "post", postId); // Get post reference

//       // Update Firestore with the new comment (using arrayUnion to append to the comments array)
//       await updateDoc(postRef, { comments: arrayUnion(comment) });

//       // Update the local state
//       setPosts((prevPosts) =>
//         prevPosts.map((post) =>
//           post.id === postId
//             ? { ...post, comments: [...(post.comments || []), comment] }
//             : post
//         )
//       );

//       // Clear the comment input after submitting
//       setCommentText({ ...commentText, [postId]: "" });
//     } catch (error) {
//       console.error("Error adding comment: ", error);
//     }
//   };

//   // Function to toggle the visibility of comments
//   const handleShowCommentsToggle = (postId) => {
//     setShowComments((prevState) => ({
//       ...prevState,
//       [postId]: !prevState[postId], // Toggle the visibility for the specific post
//     }));
//   };

//   // Fetch posts and set user when component mounts
//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setCurrentUser(user.uid); // Store user UID
//         getPosts(); // Fetch posts
//         getUsers(); // Fetch usernames and profile pictures
//       } else {
//         console.log("No authenticated user.");
//       }
//     });

//     return () => unsubscribe(); // Cleanup on unmount
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-lg font-semibold text-gray-600">Loading posts...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex justify-between">
//       <div className="w-1/4">
//         <Sidebar />
//       </div>
//       <div className="w-3/5 p-6">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold mb-6 text-gray-800">All Posts</h1>
//         </div>

//         {/* Display all posts */}
//         <div className="space-y-6">
//           {posts.map((post) => (
//             <div key={post.id} className="w-1/2 p-4 mx-auto">
//               <div className="flex items-center mb-2">
//                 {/* Display profile picture */}
//                 <img
//                   className="rounded-full w-8 mr-2"
//                   src={users[post.userId]?.profilePicURL || "/default-profile-pic.png"} // Fallback profile pic
//                   alt="Profile Pic"
//                 />
//                 <p className="text-sm text-gray-500 cursor-pointer">{users[post.userId]?.username || "Unknown User"}</p>
//               </div>
//               <hr />
//               {post.image && <img src={post.image} alt="Post" className="w-full object-cover my-4" />}
//               <hr />
//               <p className="text-gray-700 font-medium my-2">{post.desc}</p>
//               <div className="flex justify-between items-center">
//                 <div className="flex items-center">
//                   {/* Toggle like/unlike */}
//                   {post.likedBy && post.likedBy.includes(currentUser) ? (
//                     <FaHeart
//                       className="text-xl cursor-pointer text-red-500"
//                       onClick={() => handleLikeToggle(post.id, post.likes || 0, post.likedBy || [])}
//                     />
//                   ) : (
//                     <FaRegHeart
//                       className="text-xl cursor-pointer"
//                       onClick={() => handleLikeToggle(post.id, post.likes || 0, post.likedBy || [])}
//                     />
//                   )}
//                   <span className="ml-2 text-sm text-gray-600">
//                     {post.likes || 0} {post.likes === 1 ? "Like" : "Likes"}
//                   </span>
//                 </div>
//                 <div className="flex items-center">
//                   <FaRegCommentAlt className="text-xl cursor-pointer" onClick={() => handleShowCommentsToggle(post.id)} />
//                   <span className="ml-2 text-sm text-gray-600">
//                     {post.comments ? post.comments.length : 0}{" "}
//                     {post.comments && post.comments.length === 1 ? "Comment" : "Comments"}
//                   </span>
//                 </div>
//               </div>

//               {/* Comment input and submit button */}
//               {showComments[post.id] && (
//                 <div className="mt-4">
//                   {post.comments && post.comments.length > 0 && (
//                     <div className="space-y-2">
//                       {post.comments.map((comment, index) => (
//                         <div key={index} className="flex items-start space-x-2">
//                           <img
//                             className="rounded-full w-6"
//                             src={users[comment.commentedBy]?.profilePicURL || "/default-profile-pic.png"}
//                             alt="Commenter Pic"
//                           />
//                           <div>
//                             <p className="text-sm font-semibold">{users[comment.commentedBy]?.username || "Unknown User"}</p>
//                             <p className="text-xs text-gray-600">{comment.text}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   <div className="flex items-center mt-4">
//                     <input
//                       type="text"
//                       value={commentText[post.id] || ""}
//                       onChange={(e) => handleCommentChange(e, post.id)}
//                       className="border border-gray-300 rounded px-4 py-2 w-full"
//                       placeholder="Add a comment..."
//                     />
//                     <button
//                       onClick={() => handleAddComment(post.id, post.comments || [])}
//                       className="bg-blue-500 text-white px-4 py-2 ml-2 rounded"
//                     >
//                       Post
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="w-1/4">
//         <RightSidebar />
//       </div>
//     </div>
//   );
// };

// export default Home;










import React, { useEffect, useState } from "react";
import Sidebar from "../sidebar/sidebar";
import RightSidebar from "../sidebar/RightSidebar";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../slice/config"; // Firestore instance
import { FaRegCommentAlt, FaRegHeart, FaHeart } from "react-icons/fa"; // Icons
import { getAuth, onAuthStateChanged } from "firebase/auth"; // Firebase auth to get UID

const Home = () => {
  const [posts, setPosts] = useState([]); // Store posts
  const [loading, setLoading] = useState(true); // Track loading state
  const [currentUser, setCurrentUser] = useState(null); // Store current user UID
  const [commentText, setCommentText] = useState({}); // Store comment input for each post
  const [showComments, setShowComments] = useState({}); // Track visibility of comments for each post
  const [users, setUsers] = useState({}); // Store usernames and profile pictures of users

  // Fetch all users with their usernames and profile pictures
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

  // Fetch all posts
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
    } catch (error) {
      console.error("Error fetching posts: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle like/unlike a post
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

      await updateDoc(postRef, { likes: newLikesCount, likedBy: updatedLikedBy });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, likes: newLikesCount, likedBy: updatedLikedBy } : post
        )
      );
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  // Handle comment input
  const handleCommentChange = (e, postId) => {
    setCommentText({ ...commentText, [postId]: e.target.value });
  };

  // Add a comment to a post
  const handleAddComment = async (postId) => {
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

  // Toggle visibility of comments
  const handleShowCommentsToggle = (postId) => {
    setShowComments((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  // Fetch posts and set user on mount
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user.uid);
        getPosts();
        getUsers();
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="flex p-4 bg-gray-50">
      <div className="w-1/4">
        <Sidebar />
      </div>
      <div className="w-3/5 p-4 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">All Posts</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="p-4 bg-gray-100 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center mb-3">
                <img
                  className="rounded-full w-10 h-10 mr-2"
                  src={users[post.userId]?.profilePicURL || "/default-profile-pic.png"}
                  alt="Profile Pic"
                />
                <p className="text-sm font-semibold text-gray-700">{users[post.userId]?.username || "Unknown User"}</p>
              </div>
              {post.image && <img src={post.image} alt="Post" className="w-full h-auto rounded-md mb-3" />}
              <p className="text-gray-700 mb-4">{post.desc}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {post.likedBy && post.likedBy.includes(currentUser) ? (
                    <FaHeart
                      className="text-xl text-red-500 cursor-pointer"
                      onClick={() => handleLikeToggle(post.id, post.likes || 0, post.likedBy || [])}
                    />
                  ) : (
                    <FaRegHeart
                      className="text-xl cursor-pointer"
                      onClick={() => handleLikeToggle(post.id, post.likes || 0, post.likedBy || [])}
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-600">{post.likes || 0} {post.likes === 1 ? "Like" : "Likes"}</span>
                </div>
                <div className="flex items-center">
                  <FaRegCommentAlt
                    className="text-xl cursor-pointer"
                    onClick={() => handleShowCommentsToggle(post.id)}
                  />
                  <span className="ml-2 text-sm text-gray-600">{post.comments ? post.comments.length : 0} {post.comments && post.comments.length === 1 ? "Comment" : "Comments"}</span>
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
                            src={users[comment.commentedBy]?.profilePicURL || "/default-profile-pic.png"}
                            alt="Commenter Pic"
                          />
                          <div>
                            <p className="text-sm font-semibold">{users[comment.commentedBy]?.username || "Unknown User"}</p>
                            <p className="text-xs text-gray-600">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center mt-4">
                    <input
                      type="text"
                      value={commentText[post.id] || ""}
                      onChange={(e) => handleCommentChange(e, post.id)}
                      className="border border-gray-300 rounded px-4 py-2 w-full"
                      placeholder="Add a comment..."
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="bg-blue-500 text-white px-4 py-2 ml-2 rounded hover:bg-blue-600 transition duration-200"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="w-1/4">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
