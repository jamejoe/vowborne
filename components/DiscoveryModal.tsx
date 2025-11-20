import React from 'react';

interface DiscoveryModalProps {
  title: string;
  content: string;
  icon: string;
  onClose: () => void;
}

const DiscoveryModal: React.FC<DiscoveryModalProps> = ({ title, content, icon, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <img src={icon} alt={title} className="w-48 h-48 mb-6" />
        <h2 className="modal-title">{title}</h2>
        <p className="modal-body text-4xl">{content}</p>
        <div className="modal-footer">
          <button onClick={onClose} className="ui-button ui-button-primary">
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryModal;
