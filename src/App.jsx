import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Dashboard from "./Pages/Dashboard";
import History from "./Pages/History";
import MessageGeneration from "./Pages/MessageGeneration";
import SegmentationResults from "./Pages/SegmentationResults";
import UploadData from "./Pages/UploadData";
import SettingsPage from "./Pages/Settings";
import SignupPage from "./Pages/Signup";
import LoginPage from "./Pages/Login";
function App(){
return(

  <>


    <Routes>
      <Route path="/" element={<Layout currentPageName="Dashboard"><Dashboard /></Layout>}   />
      <Route path="pages/dashboard" element={<Layout currentPageName="Dashboard"><Dashboard/></Layout>}/>
      <Route path="/pages/history" element={<Layout currentPageName="History"><History/></Layout>}/>
      <Route path="/pages/segmentation-results" element={<Layout currentPageName="SegmentationResults"><SegmentationResults/></Layout>}/>
      <Route path="/pages/upload-data" element={<Layout currentPageName="UploadData"><UploadData /></Layout>}/>
      <Route path="/pages/message-generation" element={<Layout currentPageName="MessageGeneration"><MessageGeneration/></Layout>} />
      <Route path="/pages/Settings" element={<Layout currentPageName={"SettingsPage"}><SettingsPage/></Layout>}/>
      <Route path="/pages/login" element={ <LoginPage/>}/>
      <Route path="/pages/signup" element={ <SignupPage/> }/>

    </Routes>

  
  
  </>
)

}

export default App;