import { Navigate } from "react-router-dom";
import { Spinner } from "@nextui-org/react";

import '../App.css';

const ProtectedRoute = ({ user, children }) => {
  if(!user.loaded) return <div className='page'><Spinner /></div>
  else if (user?.id) return children
  else return <Navigate to="/?expired=true" replace />
};

export default ProtectedRoute