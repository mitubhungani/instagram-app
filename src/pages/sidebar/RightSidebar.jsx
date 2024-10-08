import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"; 
import React, { useEffect, useState } from "react";
import { auth, db } from "../../slice/config"; 

const RightSidebar = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log("current user:", user.uid);
        setCurrentUserId(user.uid);
        await fetchFollowedUsers(user.uid); // Fetch followed users for the current user
      } else {
        setCurrentUserId(null);
        setFollowedUsers([]);
      }
    });
    return () => unsubscribe(); 
  }, []);

  const fetchFollowedUsers = async (userId) => {
    const currentUserDocRef = doc(db, "users", userId);
    const currentUserSnapshot = await getDocs(currentUserDocRef);
    const followed = currentUserSnapshot.data().following || [];
    setFollowedUsers(followed);
  };

  const getUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUsers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const toggleFollow = async (userId) => {
    const isCurrentlyFollowed = followedUsers.includes(userId);

    try {
      const targetUserDocRef = doc(db, "users", userId);
      const currentUserDocRef = doc(db, "users", currentUserId);

      if (isCurrentlyFollowed) {
        await updateDoc(targetUserDocRef, {
          followers: arrayRemove(currentUserId),
        });
        await updateDoc(currentUserDocRef, {
          following: arrayRemove(userId),
        });
        setFollowedUsers((prev) => prev.filter((id) => id !== userId));
      } else {
        await updateDoc(targetUserDocRef, {
          followers: arrayUnion(currentUserId),
        });
        await updateDoc(currentUserDocRef, {
          following: arrayUnion(userId),
        });
        setFollowedUsers((prev) => [...prev, userId]);
      }
    } catch (error) {
      console.error("Error updating followers/following: ", error);
    }
  };

  const filteredUsers = allUsers.filter((user) => user.id !== currentUserId);

  useEffect(() => {
    getUsers(); 
  }, [currentUserId]);

  return (
    <div className="fixed bg-white shadow-lg w-80 rounded-lg p-4 m-4 top-16 right-0 z-50 h-[85vh] overflow-y-auto">
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold text-gray-700">Suggested Users</h1>
      </div>
      <div>
        {loading ? (
          <div className="flex flex-col space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="relative flex w-full animate-pulse gap-2 p-4 bg-gray-100 rounded-lg"
              >
                <div className="h-12 w-12 rounded-full bg-slate-300"></div>
                <div className="flex-1">
                  <div className="mb-2 h-5 w-3/5 rounded-lg bg-slate-300"></div>
                  <div className="h-5 w-[90%] rounded-lg bg-slate-300"></div>
                </div>
                <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-300"></div>
              </div>
            ))}
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <div
              key={index}
              className="flex items-center justify-between my-3 p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-lg transition duration-200 ease-in-out"
            >
              <div className="flex items-center">
                <img
                  className="rounded-full w-10 h-10 object-cover border border-gray-200 mr-3"
                  src={user.profilePicURL}
                  alt={`${user.username}'s profile`} 
                />
                <p className="font-medium text-gray-700">{user.username}</p>
              </div>
              <button
                onClick={() => toggleFollow(user.id)} 
                className={`px-3 py-1 rounded-lg font-semibold text-sm transition-colors ${
                  followedUsers.includes(user.id)
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
                } hover:opacity-90`}
              >
                {followedUsers.includes(user.id) ? "UnFollow" : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
