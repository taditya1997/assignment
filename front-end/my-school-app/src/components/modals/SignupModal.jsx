import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import styles from './AuthForms.module.css';

const SignupModal = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const { loading, error, register } = useApi();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ username, password, email });
      // Handle successful registration (e.g., show success message, switch to login)
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <div className={styles.authModal}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
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
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default SignupModal;
