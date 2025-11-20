
import React from 'react';
import { WorldEvent, GoogleUser } from '../types';

interface WorldEventModalProps {
  event: WorldEvent;
  user: GoogleUser | null;
  onSelectOutcome: (choice: WorldEvent['choices'][0]) => void;
}

const WorldEventModal: React.FC<WorldEventModalProps> = ({ event, user, onSelectOutcome }) => {
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2 className="modal-title">{event.title}</h2>
                <p className="modal-body text-4xl">{event.description.replace(/단장님/g, user?.name || '단장님')}</p>
                <div className="modal-footer flex-col !items-stretch !gap-4">
                    {event.choices.map((choice, index) => (
                        <button key={index} onClick={() => onSelectOutcome(choice)} className="ui-button ui-button-secondary">
                            {choice.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorldEventModal;
