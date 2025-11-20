import React, { useState } from 'react';
import { BACKGROUND_IMAGES } from '../constants';

interface SetNameScreenProps {
  onNameSet: (name: string) => void;
}

const SetNameScreen: React.FC<SetNameScreenProps> = ({ onNameSet }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim());
    }
  };

  return (
    <div className="h-full w-full bg-cover bg-center flex flex-col p-6 text-white justify-center items-center" style={{ backgroundImage: `url('${BACKGROUND_IMAGES.hubDayGarrison}')` }}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
        <div className="relative z-10 ui-panel p-12 text-center animate-fade-in-scale-up">
            <h1 className="modal-title !text-6xl">단장님의 이름은?</h1>
            <p className="text-3xl text-gray-300 mb-8">용병단을 이끌 당신의 이름을 알려주세요.</p>
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={12}
                    className="w-full max-w-lg text-center text-5xl p-4 rounded-lg bg-black/50 border-2 border-amber-600 text-white focus:outline-none focus:border-amber-400"
                    placeholder="이름 입력..."
                    autoFocus
                />
                <button type="submit" disabled={!name.trim()} className="ui-button ui-button-primary">
                    결정
                </button>
            </form>
        </div>
    </div>
  );
};

export default SetNameScreen;
