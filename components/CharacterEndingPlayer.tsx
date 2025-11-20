import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Character, CharacterEnding, DialogueLine, GoogleUser } from '../types';
import { COMMANDER_AVATARS } from '../constants';

interface CharacterEndingPlayerProps {
  ending: CharacterEnding;
  party: Character[];
  user: GoogleUser | null;
  onClose: () => void;
}

const CharacterEndingPlayer: React.FC<CharacterEndingPlayerProps> = ({ ending, party, user, onClose }) => {
  const [lineIndex, setLineIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const typingIntervalRef = useRef<number | null>(null);

  const charactersMap = new Map<string, { name: string; avatar: string }>();
  party.forEach(p => charactersMap.set(p.id, { name: p.name, avatar: p.avatar }));
  charactersMap.set('commander', { name: user?.name || '단장', avatar: COMMANDER_AVATARS.base });

  const currentLine = ending.story[lineIndex];

  const processText = useCallback((text: string) => {
    const commanderName = user?.name;
    if (commanderName) {
      return text.replace(/단장(님)?/g, (match, p1) => {
        return `${commanderName} 단장${p1 || ''}`;
      });
    }
    return text;
  }, [user]);

  const handleNext = useCallback(() => {
    const fullLine = processText(currentLine.line);
    if (typedText !== fullLine) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setTypedText(fullLine);
    } else {
      if (lineIndex < ending.story.length - 1) {
        setLineIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }
  }, [lineIndex, ending.story, typedText, currentLine, onClose, processText]);

  useEffect(() => {
    setTypedText('');
    const text = processText(currentLine.line);
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    let i = 0;
    typingIntervalRef.current = window.setInterval(() => {
      if (i < text.length) {
        setTypedText(text.substring(0, i + 1));
        i++;
      } else {
        if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
      }
    }, 40);

    return () => {
      if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
      }
    };
  }, [currentLine, processText]);

  const character = charactersMap.get(ending.characterId);
  const isCommanderSpeaking = currentLine.speaker === 'commander';
  const speakerInfo = isCommanderSpeaking ? charactersMap.get('commander') : character;
  
  return (
    <div className="absolute inset-0 z-[200] h-full w-full bg-black/80 backdrop-blur-md flex flex-col p-6 text-white cursor-pointer animate-fadeIn" onClick={handleNext}>
      <div className="relative z-10 flex-grow w-full flex flex-col items-center justify-center">
         <img 
            src={character?.avatar}
            alt={character?.name}
            className={`absolute bottom-0 h-[80%] object-contain transition-all duration-500 ${!isCommanderSpeaking ? 'brightness-110 scale-105' : 'brightness-75'}`}
            style={{ transform: 'translateX(20%)' }}
        />
        <img
          src={currentLine.avatar || COMMANDER_AVATARS.serious}
          alt="단장"
          className={`absolute bottom-0 h-[85%] object-contain transition-all duration-500 ${isCommanderSpeaking ? 'brightness-110 scale-105' : 'brightness-75'}`}
          style={{ transform: 'translateX(-20%)' }}
        />
      </div>
      <div className="relative z-20 w-full flex-shrink-0 min-h-[35%] bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col justify-end p-10">
        <div className="w-full max-w-6xl mx-auto pb-6">
          <p className="text-5xl font-bold text-yellow-300 mb-4">{speakerInfo?.name || '???'}</p>
          <p className="text-4xl text-white font-['Noto_Sans_KR'] min-h-[8rem]">{typedText}</p>
          {typedText === processText(currentLine.line) && (
            <div className="absolute bottom-0 right-0 animate-pulse text-3xl text-yellow-300 font-bold flex items-center gap-2">
              <span>다음</span>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterEndingPlayer;
