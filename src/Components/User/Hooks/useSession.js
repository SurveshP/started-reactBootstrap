import { useState, useEffect } from 'react';

const useSession = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const storedSession = JSON.parse(sessionStorage.getItem('sessionData'));
    if (storedSession) setSession(storedSession);
  }, []);

  const saveSession = (data) => {
    sessionStorage.setItem('sessionData', JSON.stringify(data));
    setSession(data);
  };

  const clearSession = () => {
    sessionStorage.removeItem('sessionData');
    setSession(null);
  };

  return { session, saveSession, clearSession };
};

export default useSession;
