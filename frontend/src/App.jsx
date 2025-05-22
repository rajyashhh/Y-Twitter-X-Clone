
import {Route, Routes} from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignupPage from "./pages/auth/signup/SignupPage";
import LoginPage from "./pages/auth/Login/LoginPage";


import { Toaster } from "react-hot-toast";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import { useQuery } from "@tanstack/react-query";
function App(){
  const {data, isLoading, error, isError} = useQuery({
    queryKey: ['authUser'],
    queryFn: async() => {
      try {
        const res = await fetch("api/auth/me");
        const data = await res.json();
        if(!res.ok || data.error){
          throw new Error(data.error || "Something went wrong")
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    }
  })

  return(
    <div className="flex max-w-5xl mx-auto">
      
      <Toaster/>
      <Sidebar/>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/notifications' element={<NotificationPage/>}/>
        <Route path='/profile/:username' element={<ProfilePage/>}/>
        
      </Routes>
      <RightPanel/>
      

    </div>
    

  )
}
export default App;