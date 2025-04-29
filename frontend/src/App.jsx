
import {Route, Routes} from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import SignupPage from "./pages/auth/signup/SignupPage";
import LoginPage from "./pages/auth/Login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";

function App(){
  return(
    <div className="flex max-w-5xl mx-auto">
      <Sidebar/>
      <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/signup' element={<SignupPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
      </Routes>
      <RightPanel/>
    </div>
    

  )
}
export default App;