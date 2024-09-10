import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { toast } from 'react-toastify';
import styles from './AuthForms.module.css';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const { loading, register } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ username, password, email });
      toast.success('Registration successful! Please log in.');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm;
