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
import OTPVerificationPage from "./Pages/OTPVerification";
import ForgotPasswordPage from "./Pages/ForgotPassword";
import DebugAuthPage from "./Pages/DebugAuth";
import ProtectedRoute from "./components/ProtectedRoute";

function App(){
return(

  <>


    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <Layout currentPageName="Dashboard"><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="pages/dashboard" element={
        <ProtectedRoute>
          <Layout currentPageName="Dashboard"><Dashboard/></Layout>
        </ProtectedRoute>
      }/>
      <Route path="/pages/history" element={
        <ProtectedRoute>
          <Layout currentPageName="History"><History/></Layout>
        </ProtectedRoute>
      }/>
      <Route path="/pages/segmentation-results" element={
        <ProtectedRoute>
          <Layout currentPageName="SegmentationResults"><SegmentationResults/></Layout>
        </ProtectedRoute>
      }/>
      <Route path="/pages/upload-data" element={
        <ProtectedRoute>
          <Layout currentPageName="UploadData"><UploadData /></Layout>
        </ProtectedRoute>
      }/>
      <Route path="/pages/message-generation" element={
        <ProtectedRoute>
          <Layout currentPageName="MessageGeneration"><MessageGeneration/></Layout>
        </ProtectedRoute>
      } />
      <Route path="/pages/Settings" element={
        <ProtectedRoute>
          <Layout currentPageName={"SettingsPage"}><SettingsPage/></Layout>
        </ProtectedRoute>
      }/>
      <Route path="/pages/login" element={ <LoginPage/>}/>
      <Route path="/pages/signup" element={ <SignupPage/> }/>
      <Route path="/pages/otp-verification" element={ <OTPVerificationPage/> }/>
      <Route path="/pages/forgot-password" element={ <ForgotPasswordPage/> }/>
      <Route path="/debug-auth" element={ <DebugAuthPage/> }/>
      <Route path="/dashboard" element={<Navigate to="/pages/dashboard" replace />} />

    </Routes>

  
  
  </>
)

}

export default App;