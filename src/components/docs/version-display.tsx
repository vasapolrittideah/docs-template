import React from 'react';

const VersionDisplay = () => {
  return <div className="text-text-soft-400 mt-10 block text-sm font-medium select-none">v{process.env.version}</div>;
};

export default VersionDisplay;
