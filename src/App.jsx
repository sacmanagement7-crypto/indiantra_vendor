import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import DashboardPage from "./routes/dashboard/page";
import Layout from "./routes/layout";
import Login from "./routes/auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Product from "./pages/Product";
import Orders from "./pages/Orders";

function App() {
  const router = createBrowserRouter([
    {
      path: "/dashboard",
      element: <ProtectedRoute />,
      children: [
        {
          element: <Layout />,
          children: [
            { index: true, element: <DashboardPage /> },
            { path: 'products', element: <Product /> },
            { path: 'orders', element: <Orders /> }
          ],
        },
      ],
    },
    {
      path: "/auth/sign-in",
      element: <Login />,
    },
    {
      path: "*",
      element: <Navigate to="/auth/sign-in" replace />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
