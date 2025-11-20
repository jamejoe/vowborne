import React from 'react';
import { QuestNotification } from '../types';

interface QuestToastProps {
  notifications: QuestNotification[];
  onRemove: (id: number) => void;
}

const QuestToast: React.FC<QuestToastProps> = ({ notifications, onRemove }) => {
  return (
    <div className="quest-toast-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`quest-toast ${notification.message === '의뢰 완료!' ? 'completed' : 'progress'}`}
          onAnimationEnd={(e) => {
            if (e.animationName === 'toast-in-out') {
              onRemove(notification.id);
            }
          }}
        >
          <img src={notification.icon} alt="Quest Icon" className="toast-icon" />
          <div>
            <p className={`toast-message ${notification.message === '의뢰 완료!' ? 'text-yellow-300' : 'text-green-400'}`}>
              {notification.message}
            </p>
            <p className="toast-title">{notification.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuestToast;