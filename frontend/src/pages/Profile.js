import React, { useState } from "react";
import { Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { authAxios } from "../stores/authStore";

const Profile = () => {
  const { user, isAuthenticated, setUser } = useAuth();
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [retypeNewPassword, setRetypeNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  const checkPasswordStrength = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
    const strengthPoints = [
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    ].filter(Boolean).length;
  
    return {
      strength: strengthPoints,
      requirements: {
        length: hasMinLength,
        upperCase: hasUpperCase,
        lowerCase: hasLowerCase,
        number: hasNumber,
        specialChar: hasSpecialChar
      }
    };
  };

  const saveDetails = async (type) => {
    setLoading(true);
    setErrorMessage("");
    try {
      let response;
      if (type === "username" && !newName.trim()) {
        setErrorMessage("Username cannot be empty");
        return;
      } else if (type === "password") {
        if (!newPassword || !retypeNewPassword) {
          setErrorMessage("Both password fields are required");
          return;
        }
        if (newPassword !== retypeNewPassword) {
          setErrorMessage("Passwords do not match");
          return;
        }

        const { strength } = checkPasswordStrength(newPassword);
        if (strength < 3) {
          setErrorMessage(`Password must meet at least 3 complexity requirements: At least 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, 1 special character`);
          return;
        }
      }

      if (type === "password") {
        response = await authAxios.put(`${process.env.REACT_APP_API_URL}/users/updatePassword`, { 
          newPassword,
          retypeNewPassword, 
          userId: user.id 
        });
      } else if (type === "username") {
        response = await authAxios.put(`${process.env.REACT_APP_API_URL}/users/updateUsername`, { 
          username: newName, 
          userId: user.id 
        });
        setUser({ username: newName });
      }
  
      if (response.status === 200) {
        setErrorMessage("");
        setIsEditingUsername(false);
        setIsEditingPassword(false);
        setIsEditingDetails(false);
        setNewPassword("");
        setRetypeNewPassword("");
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data?.error || error.response.data?.message || "An error occurred");
      } else if (error.request) {
        setErrorMessage("No response from server. Please try again.");
      } else {
        setErrorMessage(error.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile</p>
          <a 
            href="/login" 
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-pink-200 to-transparent opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-20 w-56 h-56 md:w-80 md:h-80 rounded-full bg-gradient-to-l from-blue-200 to-transparent opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-gradient-to-tr from-yellow-100 to-transparent opacity-10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      < div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md border border-gray-200/70 hover:border-blue-300 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span className="font-medium text-gray-700">Back to Home</span>
          </Link>
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-pink-50/30 opacity-30"></div>
          
          <div className="relative p-8 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 mb-2">
              Your Profile
            </h1>
            <p className="text-gray-600 mb-6">
              Manage your account details
            </p>

            {errorMessage && (
              <div className="relative bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl p-3 sm:p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-sm text-red-700 flex-1 min-w-0 break-words">
                    {errorMessage}
                  </div>
                  <button
                    onClick={() => setErrorMessage("")}
                    className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors ml-2"
                    aria-label="Close error message"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {!isEditingDetails ? (
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="text-lg font-medium text-gray-800">{user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-lg font-medium text-gray-800">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Password</p>
                      <p className="text-lg font-medium text-gray-800">••••••••</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="w-full py-2 md:py-3 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  Edit Details
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Information</h3>
                  
                  <div className="space-y-4">
                    {/* Username Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                      {isEditingUsername ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-2 md:p-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                          />
                          <div className="flex space-x-3">
                            <button
                              onClick={() => saveDetails("username")}
                              disabled={loading}
                              className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingUsername(false);
                                setErrorMessage("");
                              }}
                              className="flex-1 py-2 bg-gray-200/90 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-gray-800">{user.username}</p>
                          <button
                            onClick={() => setIsEditingUsername(true)}
                            className="py-1 px-3 bg-blue-100/90 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors shadow-sm"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Password Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                      {isEditingPassword ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">New Password</label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full p-2 md:p-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                aria-label={showNewPassword ? "Hide password" : "Show password"}
                              >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {showNewPassword ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  )}
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm text-gray-500 mb-1">Confirm Password</label>
                            <div className="relative">
                              <input
                                type={showRetypePassword ? "text" : "password"}
                                value={retypeNewPassword}
                                onChange={(e) => setRetypeNewPassword(e.target.value)}
                                className="w-full p-2 md:p-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRetypePassword(!showRetypePassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                aria-label={showRetypePassword ? "Hide password" : "Show password"}
                              >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  {showRetypePassword ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                  )}
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => saveDetails("password")}
                              disabled={loading}
                              className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                            >
                              {loading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingPassword(false);
                                setErrorMessage("");
                              }}
                              className="flex-1 py-2 bg-gray-200/90 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-gray-800">••••••••</p>
                          <button
                            onClick={() => setIsEditingPassword(true)}
                            className="py-1 px-3 bg-blue-100/90 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors shadow-sm"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsEditingDetails(false);
                    setIsEditingUsername(false);
                    setIsEditingPassword(false);
                    setErrorMessage("");
                  }}
                  className="w-full py-3 bg-white/90 backdrop-blur-sm border border-gray-200/50 text-gray-700 font-semibold rounded-xl hover:bg-gray-100/90 transition-all shadow-sm hover:shadow-md"
                >
                  Back to Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;