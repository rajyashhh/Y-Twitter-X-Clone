import {Navigate, Route, Routes} from "react-router-dom";
import HomePage from "./pages/home/HomePage.jsx";
import SignupPage from "./pages/auth/Signup/SignupPage.jsx";
import LoginPage from "./pages/auth/Login/LoginPage.jsx";
import SearchPage from "./pages/home/SearchPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPassword/ForgotPassword.jsx";
import { Toaster } from "react-hot-toast";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import FollowersPage from "./pages/profile/FollowersPage";
import FollowingPage from "./pages/profile/FollowingPage";
import PrivacyPolicyPage from "./pages/important/PrivacyPolicyPage.jsx"
import CancellationAndRefundPage from "./pages/important/CancellationAndRefundPage.jsx";
import ContactUsPage from "./pages/important/ContactUsPage.jsx";
import ShippingAndDeliveryPage from "./pages/important/ShippingAndDeliveryPage.jsx";
import TermsAndConditionsPage from "./pages/important/TermsAndConditionsPage.jsx";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/common/ErrorBoundary";

function App(){
  const {data:authUser, isLoading} = useQuery({
    queryKey: ['authUser'],
    queryFn: async() => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if(!res.ok || data.error){
          throw new Error(data.error || "Something went wrong")
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry:false,
    refetchOnWindowFocus: false, // Add this
    refetchOnMount: true,        // Add this
    refetchOnReconnect: true,    // Add this
    staleTime: 5 * 60 * 1000,   // Keep data fresh for 5 minutes
  })
  if(isLoading){
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg"/>
      </div>
    )
  }
  return(
    <div className="flex max-w-5xl mx-auto">
      
      <Toaster/>
      {authUser && <Sidebar/> }
      
      <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <Navigate to="/login" />}/>
        <Route path='/signup' element={!authUser?<SignupPage/>:<Navigate to="/"/>}/>
        <Route path='/login' element={authUser ?  <Navigate to="/"/>:<LoginPage/>}/>
        <Route path='/forgot-password' element={authUser ?  <Navigate to="/"/>:<ForgotPasswordPage/>}/>

        <Route 
          path='/notifications' 
          element={
            authUser ? (
              <ErrorBoundary>
                <NotificationPage/>
              </ErrorBoundary>
            ) : (
              <Navigate to="/login"/>
            )
          }
        />
        <Route path='/profile/:username' element={authUser ? <ProfilePage/> : <Navigate to = "/login"/>}/>
        <Route path='/profile/:username/followers' element={authUser ? <FollowersPage/> : <Navigate to = "/login"/>}/>
        <Route path='/profile/:username/following' element={authUser ? <FollowingPage/> : <Navigate to = "/login"/>}/>
        <Route path="/search" element={authUser ? <SearchPage authUser={authUser} /> : <Navigate to="/login" />} />
        <Route path="/privacy-policy" element={ <PrivacyPolicyPage />} />
        <Route path="/contact-us" element={ <ContactUsPage />} />
        <Route path="/cancellation" element={ <CancellationAndRefundPage />} />
        <Route path="/shipping" element={ <ShippingAndDeliveryPage />} />
        <Route path="/terms-n-conditions" element={ <TermsAndConditionsPage />} />
      </Routes>
      {authUser && <RightPanel/> }
      
      

    </div>
    

  )
}
export default App;