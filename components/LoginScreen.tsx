




import React, { useEffect, useState } from 'react';
import { BACKGROUND_IMAGES } from '../constants';

declare global {
  interface Window {
    google: any;
  }
}

interface LoginScreenProps {
  onLoginSuccess: (response: any) => void;
  onGuestLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onGuestLogin }) => {
  const [isGoogleClientConfigured, setIsGoogleClientConfigured] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      
      if (window.google && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: onLoginSuccess,
          });
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { theme: 'outline', size: 'large', text: 'signin_with', shape: 'rectangular', logo_alignment: 'left', width: '360' }
          );
          setIsGoogleClientConfigured(true);
        } catch (error) {
          console.error("Google Sign-In initialization failed:", error);
          setIsGoogleClientConfigured(false);
        }
      } else {
        setIsGoogleClientConfigured(false);
      }
    }, 500);
  }, [onLoginSuccess]);

  return (
    <div 
      className="h-full w-full bg-gray-900 bg-cover bg-center relative flex flex-col items-center justify-center text-white overflow-hidden p-8" 
      style={{backgroundImage: `url('${BACKGROUND_IMAGES.title}')`}}
    >
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="relative z-10 animate-fade-in-scale-up flex flex-col items-center justify-between h-full w-full py-20">
        <div className="w-full max-w-4xl mt-20">
          <img src={`https://i.postimg.cc/h4pMXXNK/01-Title-Logo.png`} alt="Vowborne Logo" className="w-full h-auto" />
        </div>
        
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
          <div id="google-signin-button" className="flex justify-center scale-150 transform"></div>

          {isGoogleClientConfigured ? (
             <p className="text-gray-400 text-3xl">또는</p>
          ) : (
            <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-center">
              <p className="font-bold text-2xl">Google 로그인이 설정되지 않았습니다.</p>
              <p className="text-xl">Google Client ID 환경 변수를 설정해야 합니다.</p>
            </div>
          )}
         
          <button 
            onClick={onGuestLogin}
            className="ui-button ui-button-secondary w-full"
          >
            게스트로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
