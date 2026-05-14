import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TodoListPage from './pages/TodoListPage';
import CategoryPage from './pages/CategoryPage';
import MyProfilePage from './pages/MyProfilePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
        </Route>
        <Route path="/" element={<Navigate to="/todos" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
