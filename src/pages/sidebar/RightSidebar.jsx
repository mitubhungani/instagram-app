import { collection, getDocs } from "firebase/firestore"; // Use getDocs to get multiple documents
import React, { useEffect, useState } from "react";
import { auth, db } from "../../slice/config"; // Import your Firebase config

const RightSidebar = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]); // State to store followed users
  const [loading, setLoading] = useState(true); // Loading state

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("current user:", user.uid);
    }
  });

  // Fetch users from Firestore
  const getUsers = async () => {
    setLoading(true); // Start loading when fetching users
    try {
      const usersCollection = collection(db, "users"); // Create reference to 'users' collection
      const usersSnapshot = await getDocs(usersCollection); // Fetch all docs from the collection
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })); // Map through the snapshot to get data
      setAllUsers(usersList); // Set the retrieved users to state
    } catch (error) {
      console.error("Error fetching users: ", error); // Handle error
    } finally {
      setLoading(false); // Stop loading once data is fetched
    }
  };

  useEffect(() => {
    getUsers(); // Fetch users when component mounts
  }, []);

  // Toggle follow/unfollow status
  const toggleFollow = (userId) => {
    setFollowedUsers((prevFollowedUsers) => {
      if (prevFollowedUsers.includes(userId)) {
        // If already followed, remove from the list (unfollow)
        return prevFollowedUsers.filter((id) => id !== userId);
      } else {
        // If not followed, add to the list (follow)
        return [...prevFollowedUsers, userId];
      }
    });
  };

  return (
    <div className="">
      <div>
        <div className="text-center">
          <h1>Suggested Users</h1>
        </div>
        <div className="p-1">
          {loading ? ( // Show loading indicator while fetching
            /* Loading animation */
            <div className="relative flex w-64 animate-pulse gap-2 p-4">
              <div className="h-12 w-12 rounded-full bg-slate-400"></div>
              <div className="flex-1">
                <div className="mb-1 h-5 w-3/5 rounded-lg bg-slate-400 text-lg"></div>
                <div className="h-5 w-[90%] rounded-lg bg-slate-400 text-sm"></div>
              </div>
              <div className="absolute bottom-5 right-0 h-4 w-4 rounded-full bg-slate-400"></div>
            </div>
          ) : (
            allUsers.map((user, index) => (
              <div key={index} className="cursor-pointer">
                <div className="flex items-center justify-between my-2">
                  <div className="flex items-center">
                    <img
                      className="rounded-full w-10 mr-3"
                      src={user.profilePicURL}
                      alt={`${user.username}'s profile`} // Add alt text for accessibility
                    />
                    <p>{user.username}</p> {/* Display each user's username */}
                  </div>
                  <div>
                    {/* Toggle Follow/Unfollow button */}
                    <button
                      onClick={() => toggleFollow(user.id)} // Toggle follow status on click
                      className="text-blue-700 border rounded-md px-2"
                    >
                      {followedUsers.includes(user.id) ? "UnFollow" : "Follow"}
                    </button>
                  </div>
                </div>
                <hr />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
