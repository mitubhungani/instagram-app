// import React, { useEffect, useState } from "react";
// import { CgProfile } from "react-icons/cg";
// import { FaHome, FaPlus } from "react-icons/fa";
// import { TbLogout2 } from "react-icons/tb";
// import { Link, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// // import { logout } from "../../slice/UserSlice";
// import { Logout, auth } from "../../slice/config"; // Import the auth object
// import { onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged
// import logo from "../../../public/logo.png";

// const Sidebar = () => {
//   const [uid, setUid] = useState(null); // State to store the user's uid
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Fetch the logged-in user's uid
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUid(user.uid); // Set the user's uid
//       } else {
//         navigate("/login"); // Redirect to login if user is not logged in
//       }
//     });

//     // Clean up the listener when the component unmounts
//     return () => unsubscribe();
//   }, [navigate]);

//   // Handle logout
//   const handleLogout = async () => {
//     try {
//       await Logout(); // Sign out from Firebase Auth
//       // dispatch(logout()); // Clear user data in Redux store
//       localStorage.removeItem("user"); // Remove user data from localStorage

//       navigate("/login"); // Redirect to login page after logout
//     } catch (error) {
//       console.error("Failed to log out: ", error);
//     }
//   };

//   return (
//     <div>
//       <div className="bg-black text-white flex flex-col justify-between h-screen fixed w-[250px]">
//         <div>
//           <Link to="/">
//             <img src={logo} alt="Logo" />
//           </Link>
//         </div>
//         <div className="flex flex-col h-1/5 justify-around">
//           {uid && (
//             <>
//               <Link
//                 className="flex items-center justify-around m-auto w-1/2 text-center"
//                 to={`/`}
//               >
//                 <FaHome className="text-2xl" /> Home
//               </Link>
//               <Link
//                 className="flex items-center justify-around m-auto w-1/2 text-center"
//                 to={`/createpost/${uid}`}
//               >
//                 <FaPlus className="text-2xl" /> Create Post
//               </Link>
//               <Link
//                 className="flex items-center justify-around m-auto w-1/2 text-center"
//                 to={`/profile/${uid}`}
//               >
//                 <CgProfile className="text-2xl" /> Profile
//               </Link>
//             </>
//           )}
//         </div>
//         <div className="h-1/6 w-full">
//           <div>
//             <button
//               className="flex items-center justify-around w-1/3 m-auto text-center"
//               onClick={handleLogout}
//             >
//               <TbLogout2 className="text-2xl text-red-700" /> Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;














import React, { useEffect, useState } from "react";
import { CgProfile } from "react-icons/cg";
import { FaHome, FaPlus } from "react-icons/fa";
import { TbLogout2 } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Logout, auth } from "../../slice/config"; 
import { onAuthStateChanged } from "firebase/auth"; 
import logo from "../../../public/logo.png";

const Sidebar = () => {
  const [uid, setUid] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State to control sidebar toggle
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch the logged-in user's uid
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await Logout(); 
      localStorage.removeItem("user"); 
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out: ", error);
    }
  };

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-full">
      {/* Toggle Button for Mobile Screens */}
      <button
        className="block lg:hidden p-2 text-white bg-black fixed top-4 left-4 z-20"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed top-0 left-0 h-full w-[250px] bg-black text-white flex flex-col justify-between transition-transform duration-300 ease-in-out z-10`}
      >
        {/* Logo */}
        <div className="p-4">
          <Link to="/">
            <img src={logo} alt="Logo" className=" h-auto mx-auto" />
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-6 mt-10">
          {uid && (
            <>
              <Link
                className="flex items-center justify-around text-center hover:bg-gray-800 p-2 mx-4 rounded"
                to={`/`}
              >
                <FaHome className="text-2xl" />
                <span className="ml-2">Home</span>
              </Link>
              <Link
                className="flex items-center justify-around text-center hover:bg-gray-800 p-2 mx-4 rounded"
                to={`/createpost/${uid}`}
              >
                <FaPlus className="text-2xl" />
                <span className="ml-2">Create Post</span>
              </Link>
              <Link
                className="flex items-center justify-around text-center hover:bg-gray-800 p-2 mx-4 rounded"
                to={`/profile/${uid}`}
              >
                <CgProfile className="text-2xl" />
                <span className="ml-2">Profile</span>
              </Link>
            </>
          )}
        </div>

        {/* Logout Button */}
        <div className="flex justify-center p-4">
          <button
            className="flex items-center justify-around text-center w-3/4 bg-red-600 p-2 rounded hover:bg-red-700 transition duration-200"
            onClick={handleLogout}
          >
            <TbLogout2 className="text-2xl" />
            <span className="ml-2">Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-0 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
