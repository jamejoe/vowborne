

import React from 'react';

// This component is obsolete and replaced by the Prologue component.
// It is kept in the project structure but will be removed in future updates.
const CharacterCreation: React.FC<{ onCharacterCreate: (job: any) => void }> = ({ onCharacterCreate }) => {
  return (
    <div>
      <p>Loading game...</p>
    </div>
  );
};

export default CharacterCreation;