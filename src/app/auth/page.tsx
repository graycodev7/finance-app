"use client";

import { useState } from 'react';
import { LoginForm } from '@/components/login-form';

export default function AuthPage() {
  const [showRegister, setShowRegister] = useState(false);

  const toggleMode = () => {
    setShowRegister(!showRegister);
  };

  return (
    <LoginForm 
      onToggleMode={toggleMode} 
      showRegister={showRegister} 
    />
  );
}
