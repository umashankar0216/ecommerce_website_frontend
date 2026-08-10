// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../../context/AuthContext';
// import { Alert, Input, Button } from '../../../components/UI.jsx';
// import './auth.css';

// // ============================================================================
// // 1. REGISTER COMPONENT
// // ============================================================================
// export const Register = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     username: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [serverError, setServerError] = useState('');
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) newErrors.name = 'Full name is required';
//     if (!formData.username.trim()) newErrors.username = 'Username is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
//       newErrors.email = 'Valid email is required';
    
//     if (!formData.password) newErrors.password = 'Password is required';
//     else if (formData.password.length < 6)
//       newErrors.password = 'Password must be at least 6 characters';
    
//     if (formData.password !== formData.confirmPassword)
//       newErrors.confirmPassword = 'Passwords do not match';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setServerError('');

//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       await register(formData);
//       alert('Registration successful! Please log in to continue.');
      
//       // Redirect to login page
//       navigate('/login');
//     } catch (err) {
//       setServerError(err.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <h1>Create Account</h1>
//         <p className="auth-subtitle">Join E-SHOP for exclusive deals & easy checkout</p>

//         {serverError && <Alert type="error" message={serverError} />}

//         <form onSubmit={handleSubmit}>
//           <Input
//             label="Full Name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             error={errors.name}
//             placeholder="Enter your full name"
//           />

//           <Input
//             label="Username"
//             name="username"
//             value={formData.username}
//             onChange={handleChange}
//             error={errors.username}
//             placeholder="Choose a username"
//           />

//           <Input
//             label="Email"
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             error={errors.email}
//             placeholder="your@email.com"
//           />

//           <Input
//             label="Password"
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             error={errors.password}
//             placeholder="At least 6 characters"
//           />

//           <Input
//             label="Confirm Password"
//             type="password"
//             name="confirmPassword"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             error={errors.confirmPassword}
//             placeholder="Re-enter your password"
//           />

//           <Button type="submit" loading={loading} className="full-width">
//             Create Account
//           </Button>
//         </form>

//         <p className="auth-footer">
//           Already have an account? <Link to="/login">Log in here</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // 2. LOGIN COMPONENT
// // ============================================================================
// export const Login = () => {
//   const [credentials, setCredentials] = useState({
//     userNameOrEmail: '',
//     password: '',
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [serverError, setServerError] = useState('');

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const validateForm = () => {
//     const newErrors = {};
//     if (!credentials.userNameOrEmail.trim()) {
//       newErrors.userNameOrEmail = 'Email or username is required';
//     }
//     if (!credentials.password) {
//       newErrors.password = 'Password is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCredentials((prev) => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setServerError('');

//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       // ✅ Pass credentials cleanly. AuthContext handles state & LocalStorage.
//       await login(credentials);

//       // Navigate to home upon success
//       navigate('/');
//     } catch (err) {
//       setServerError(err.message || 'Invalid username or password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-container">
//       <div className="auth-card">
//         <h1>Welcome Back</h1>
//         <p className="auth-subtitle">Log in to your E-SHOP account</p>

//         {serverError && <Alert type="error" message={serverError} />}

//         <form onSubmit={handleSubmit}>
//           <Input
//             label="Email or Username"
//             name="userNameOrEmail"
//             value={credentials.userNameOrEmail}
//             onChange={handleChange}
//             error={errors.userNameOrEmail}
//             placeholder="your@email.com or username"
//           />

//           <Input
//             label="Password"
//             type="password"
//             name="password"
//             value={credentials.password}
//             onChange={handleChange}
//             error={errors.password}
//             placeholder="Enter your password"
//           />

//           <Button type="submit" loading={loading} className="full-width">
//             Log In
//           </Button>
//         </form>

//         <p className="auth-footer">
//           Don't have an account? <Link to="/register">Sign up here</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Alert, Input, Button } from '../../../components/UI.jsx';
import './auth.css';

// ============================================================================
// 1. REGISTER COMPONENT
// ============================================================================
export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Valid email is required';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData);
      alert('Registration successful! Please log in to continue.');
      
      // Redirect to login page
      navigate('/login');
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join E-SHOP for exclusive deals & easy checkout</p>

        {serverError && <Alert type="error" message={serverError} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
          />

          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            placeholder="Choose a username"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="your@email.com"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="At least 6 characters"
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Re-enter your password"
          />

          <Button type="submit" loading={loading} className="full-width">
            Create Account
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// 2. LOGIN COMPONENT WITH ROLE SELECTION TOGGLE
// ============================================================================
export const Login = () => {
  // Role selection state ('customer' or 'admin')
  const [role, setRole] = useState('customer');

  const [credentials, setCredentials] = useState({
    userNameOrEmail: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!credentials.userNameOrEmail.trim()) {
      newErrors.userNameOrEmail = 'Email or username is required';
    }
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Pass credentials and role to login handler
      const user = await login({ ...credentials, role });

      // Dynamic redirection depending on selected role
      if (role === 'admin') {
        navigate('/admin'); // Redirects to Admin Dashboard
      } else {
        navigate('/'); // Redirects to Storefront Home
      }
    } catch (err) {
      setServerError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">
          {role === 'customer'
            ? 'Log in to your E-SHOP account'
            : 'Access the Admin Control Panel'}
        </p>

        {/* Role Selection Toggle */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => {
              setRole('customer');
              setServerError('');
            }}
          >
            Customer
          </button>
          <button
            type="button"
            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setRole('admin');
              setServerError('');
            }}
          >
            Admin
          </button>
        </div>

        {serverError && <Alert type="error" message={serverError} />}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email or Username"
            name="userNameOrEmail"
            value={credentials.userNameOrEmail}
            onChange={handleChange}
            error={errors.userNameOrEmail}
            placeholder={
              role === 'customer'
                ? 'your@email.com or username'
                : 'admin_username or admin@email.com'
            }
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
          />

          <Button type="submit" loading={loading} className="full-width">
            {role === 'customer' ? 'Log In as Customer' : 'Log In as Admin'}
          </Button>
        </form>

        {role === 'customer' && (
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        )}
      </div>
    </div>
  );
};