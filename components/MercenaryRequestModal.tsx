import React from 'react';
import { Commander, Character, MercenaryRequest } from '../types';
import { BLUEPRINTS, TRAINING_COURSES, RAPPORT_EVENTS, CRAFTING_MATERIALS } from '../constants';

interface MercenaryRequestModalProps {
  commander: Commander;
  party: Character[];
  requests: MercenaryRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onClose: () => void;
}

const MercenaryRequestModal: React.FC<MercenaryRequestModalProps> = ({ commander, party, requests, onAccept, onDecline, onClose }) => {
  if (requests.length === 0) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content !w-auto !max-w-5xl" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">용병 제안</h2>
        <div className="w-full max-h-[60vh] overflow-y-auto space-y-6 p-4 text-left">
          {requests.map(request => {
            const merc = party.find(p => p.id === request.characterId);
            if (!merc) return null;

            let requestDetails = null;
            let requestTitle = "제안";

            if (request.type === 'craft' && request.payload.blueprintId) {
              const bp = BLUEPRINTS[request.payload.blueprintId];
              if (bp) {
                requestTitle = "제작 요청";
                requestDetails = (
                  <div>
                    <p className="text-4xl font-bold">대상: <span className="text-purple-400">{bp.name}</span></p>
                    <p className="text-3xl">단장 제작 비용: <span className="text-red-400">{bp.craftingCost} G</span></p>
                    <p className="text-3xl">용병 구매 가격: <span className="text-green-400">{bp.craftingCost * 2} G</span> (현재 소지금: {merc.gold} G)</p>
                  </div>
                );
              }
            } else if (request.type === 'train' && request.payload.courseId) {
              const course = TRAINING_COURSES.find(c => c.id === request.payload.courseId);
              if (course) {
                requestTitle = "특별 훈련 요청";
                requestDetails = (
                  <div>
                    <p className="text-4xl font-bold">과정: <span className="text-blue-400">{course.name}</span></p>
                    <p className="text-3xl">단장 지원 비용: <span className="text-red-400">{course.commanderBoost.cost} G</span></p>
                     <p className="text-3xl">용병 훈련 비용: <span className="text-red-400">{course.cost} G</span> (현재 소지금: {merc.gold} G)</p>
                  </div>
                );
              }
            } else if (request.type === 'outing' && request.payload.eventId) {
                const event = RAPPORT_EVENTS[request.payload.eventId];
                if (event) {
                    requestTitle = "외출 제안";
                    requestDetails = (
                        <div>
                            <p className="text-4xl font-bold">장소: <span className="text-pink-400">마을</span></p>
                            <p className="text-3xl">함께 시간을 보내며 친목을 다지고 싶어합니다.</p>
                        </div>
                    );
                }
            } else if (request.type === 'give_gift' && request.payload.eventId) {
                const event = RAPPORT_EVENTS[request.payload.eventId];
                if (event && event.payload.gift) {
                    requestTitle = "선물";
                    const gift = event.payload.gift;
                    let giftText = "";
                    if (gift.type === 'gold') {
                        giftText = `${gift.amount} G`;
                    } else if (gift.type === 'material') {
                        const matInfo = CRAFTING_MATERIALS[gift.id];
                        giftText = matInfo ? `${matInfo.name} x${gift.quantity}` : "알 수 없는 아이템";
                    }
                    requestDetails = (
                        <div>
                            <p className="text-4xl font-bold">선물: <span className="text-green-400">{giftText}</span></p>
                            <p className="text-3xl">감사의 마음을 담은 작은 선물입니다.</p>
                        </div>
                    );
                }
            }

            return (
              <div key={request.id} className="bg-black/20 p-6 rounded-lg flex gap-6 ui-panel">
                <img src={merc.avatar} alt={merc.name} className="w-40 h-40 rounded-full object-cover border-4 border-amber-600 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="text-4xl font-bold">{merc.name}의 {requestTitle}</p>
                  <blockquote className="text-3xl italic my-3 p-3 bg-black/20 rounded-md border-l-4 border-gray-500">
                    "{request.dialogue}"
                  </blockquote>
                  <div className="my-3">{requestDetails}</div>
                  <div className="flex gap-6 mt-4">
                    <button onClick={() => onAccept(request.id)} className="ui-button ui-button-success">수락</button>
                    <button onClick={() => onDecline(request.id)} className="ui-button ui-button-secondary">거절</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="ui-button ui-button-primary">닫기</button>
        </div>
      </div>
    </div>
  );
};

export default MercenaryRequestModal;