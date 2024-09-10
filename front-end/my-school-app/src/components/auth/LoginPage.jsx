import { useState } from 'react';
import LoginModal from '../LoginModal';
import SignupModal from '../SignupModal';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.loginPage}>
      <div className={styles.imageSection}>
        {/* Add your image here */}
        <img src="/path-to-your-image.jpg" alt="Login" className={styles.loginImage} />
      </div>
      <div className={styles.formSection}>
        <div className={styles.formToggle}>
          <button 
            className={`${styles.toggleButton} ${isLogin ? styles.active : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`${styles.toggleButton} ${!isLogin ? styles.active : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>
        {isLogin ? <LoginModal /> : <SignupModal />}
      </div>
    </div>
  );
};

export default LoginPage;
