





import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleUser } from '../types';
import { COMMANDER_AVATARS, BACKGROUND_IMAGES } from '../constants';

interface PrologueProps {
  user: GoogleUser | null;
  onPrologueEnd: () => void;
}

const script = [
  { scene: 'dark', speaker: 'rhea', text: "자, 소환 의식은 성공인가? 전설에 나오는 위대한 단장이 정말로 오셨을까?" },
  { scene: 'dark', speaker: 'elina', text: "와! 드디어! 이 지긋지긋한 전투도 이제 끝이겠죠? 전설의 단장님이라니, 얼마나 멋질까!" },
  { scene: 'dark', speaker: 'celen', text: "흥, 전설 따위 믿을 수 없어. 효과가 있는 소환진이었는지부터 의심스럽군." },
  { scene: 'summon', speaker: 'rhea', text: "... ... 저기, 빛 속의 저분은...?" },
  { scene: 'summon', speaker: 'commander', commanderAvatar: COMMANDER_AVATARS.summon, text: "(번쩍!)" },
  { scene: 'hub', speaker: 'commander', commanderAvatar: COMMANDER_AVATARS.scared, text: "으악! 여긴 어디야?! 납치?! 나 그냥 평범한 고등학생인데?!" },
  { scene: 'hub', speaker: 'celen', text: "...이게 그 전설의 단장이라고? 그냥 평범한 인간이잖아." },
  { scene: 'hub', speaker: 'rhea', text: "하아... 뭔가 잘못된 게 틀림없어. 내 서약의 낙인이 저 사람에게 반응하고 있는데..." },
  { scene: 'hub', speaker: 'commander', commanderAvatar: COMMANDER_AVATARS.serious, text: "서약? 낙인? 무슨 소리야? 그리고 당신들은 누구야?" },
  { scene: 'hub', speaker: 'rhea', text: "저는 리아, 이쪽은 엘리나, 그리고 저 퉁명스러운 아이는 셀렌. 우리는... 용병입니다. 그리고 당신을 소환한 장본인들이죠." },
  { scene: 'hub', speaker: 'commander', commanderAvatar: COMMANDER_AVATARS.base, text: "용병? 소환? 이게 무슨 게임 같은 소리야..." },
  { scene: 'hub', speaker: 'elina', text: "단장님! 저희를 구해주세요! 세상이 곧 멸망할지도 모른단 말이에요! 전설에 따르면 위대한 단장님만이 저희를 이끌고 세상을 구할 수 있어요!" },
  { scene: 'hub', speaker: 'commander', commanderAvatar: COMMANDER_AVATARS.scared, text: "나한테 그런 힘은 없어! 난 그냥 평범한 학생이란 말이야!" },
  { scene: 'hub', speaker: 'rhea', text: "상황이 어떻든, 당신은 이미 이곳 '보우본'에 소환되었습니다. 돌아갈 방법은... 현재로선 알 수 없습니다." },
  { scene: 'hub', speaker: 'celen', text: "결국, 우리와 함께 이 세계에서 살아남는 수밖에 없다는 뜻이지. 당신이 전설의 단장이든 아니든." },
  { scene: 'hub', speaker: 'commander', commanderAvatar: COMMANDER_AVATARS.base, text: "...선택의 여지가 없다는 거네. 좋아. 일단 상황을 파악해봐야겠어. 여기서 뭘 해야 하지?" },
  { scene: 'hub', speaker: 'rhea', text: "우선... 저희 용병단을 재정비하고, 흩어진 동료들을 찾아야 합니다. 그리고 이 땅을 위협하는 어둠의 근원을 찾아 파괴해야 합니다." },
  { scene: 'hub', speaker: 'elina', text: "제가 단장님을 잘 보좌할게요! 우리 함께 힘내요!" },
  { scene: 'hub', speaker: 'celen', text: "...죽지나 마." },
  { scene: 'hub', speaker: 'commander', commanderAvatar: COMMANDER_AVATARS.serious, text: "(이세계라니... 믿을 수 없지만, 여기서 살아남아야만 해. 이들을 이끌고... 세상을 구해야 한다고? 내가?)" },
  { scene: 'hub', speaker: 'commander', commanderAvatar: COMMANDER_AVATARS.base, text: "좋아, 시작해보자. 나의 용병단." },
];

const Prologue: React.FC<PrologueProps> = ({ user, onPrologueEnd }) => {
  const [index, setIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const typingIntervalRef = useRef<number | null>(null);

  const currentLine = script[index];
  const speakerIsCommander = currentLine.speaker === 'commander';
  // Use specific character images directly
  const characterAvatars: Record<string, string> = {
    rhea: 'https://i.postimg.cc/s2TC6j10/01-Char-A.png',
    elina: 'https://i.postimg.cc/zfxYtzVZ/02-Char-A.png',
    celen: 'https://i.postimg.cc/3wtQS8dM/03-Char-A.png',
  };

  const speakerName = speakerIsCommander ? (user?.name || '단장') : currentLine.speaker;
  const speakerAvatar = speakerIsCommander ? currentLine.commanderAvatar : characterAvatars[currentLine.speaker];
  
  const handleNext = useCallback(() => {
    if (typedText === currentLine.text) {
      if (index < script.length - 1) {
        setIndex(i => i + 1);
      } else {
        onPrologueEnd();
      }
    } else {
      if(typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      setTypedText(currentLine.text);
    }
  }, [typedText, currentLine.text, index, onPrologueEnd]);

  useEffect(() => {
    setTypedText('');
    if(typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    let i = 0;
    const text = currentLine.text;
    typingIntervalRef.current = window.setInterval(() => {
      if (i < text.length) {
        setTypedText(text.substring(0, i + 1));
        i++;
      } else {
        if(typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      }
    }, 50);

    return () => {
        if(typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    }
  }, [currentLine]);

  const bgImage = currentLine.scene === 'dark' ? 'none' : currentLine.scene === 'summon' ? COMMANDER_AVATARS.summon : BACKGROUND_IMAGES.hubDayCamp;
  const bgColor = currentLine.scene === 'dark' ? 'black' : 'transparent';
  
  return (
    <div 
      className="h-full w-full bg-cover bg-center flex flex-col justify-end text-white relative cursor-pointer"
      style={{ backgroundImage: `url('${bgImage}')`, backgroundColor: bgColor }}
      onClick={handleNext}
    >
      <button onClick={(e) => { e.stopPropagation(); onPrologueEnd(); }} className="absolute top-8 right-8 z-20 ui-button ui-button-secondary !text-3xl !p-4">
          스킵
      </button>

      <div className="absolute inset-0 bg-black/40"></div>
      {currentLine.scene !== 'dark' && currentLine.scene !== 'summon' && (
         <div className="absolute inset-x-0 bottom-0 h-2/3 flex items-end justify-center">
             {speakerAvatar && <img src={speakerAvatar} alt={speakerName} className="h-full w-auto object-contain animate-fade-in-scale-up"/>}
         </div>
      )}
      <div className="relative z-10 p-12 bg-gradient-to-t from-black via-black/80 to-transparent">
        <p className="text-4xl font-bold mb-4 text-yellow-300">{speakerName}</p>
        <p className="text-5xl font-['Noto_Sans_KR'] min-h-[8rem]">{typedText}</p>
         {typedText === currentLine.text && (
            <div className="absolute bottom-6 right-10 animate-pulse text-3xl text-yellow-300 font-bold flex items-center gap-2">
              <span>다음</span>
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"></path></svg>
            </div>
        )}
      </div>
    </div>
  );
};

export default Prologue;