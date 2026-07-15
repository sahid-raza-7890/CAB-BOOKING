import React from 'react';

const AmenitySelector = ({ prefs, setPrefs }) => {
  return (
    <div className="premium-glass p-6 rounded-3xl mt-4">
      <h2 className="text-lg font-bold mb-4">Trip Preferences</h2>
      <div className="flex flex-col gap-4">
        <button 
          type="button"
          onClick={() => setPrefs({...prefs, silent: !prefs.silent})}
          className={`p-4 rounded-xl border transition-colors font-semibold ${prefs.silent ? 'bg-[#FFD700] text-black border-[#FFD700]' : 'bg-[#121212] border-white/10 text-white'}`}>
          🤫 Silent Ride
        </button>
        <select 
          value={prefs.temp || 'cool'}
          className="bg-[#121212] text-white p-4 rounded-xl border border-white/10 outline-none focus:border-[#FFD700]"
          onChange={(e) => setPrefs({...prefs, temp: e.target.value})}>
          <option value="cool">🌡️ Cool</option>
          <option value="warm">🌡️ Warm</option>
        </select>
        <select 
          value={prefs.music || 'none'}
          className="bg-[#121212] text-white p-4 rounded-xl border border-white/10 outline-none focus:border-[#FFD700]"
          onChange={(e) => setPrefs({...prefs, music: e.target.value})}>
          <option value="none">🎵 No Music Preference</option>
          <option value="pop">🎵 Pop</option>
          <option value="classical">🎵 Classical</option>
          <option value="lo-fi">🎵 Lo-fi</option>
        </select>
      </div>
    </div>
  );
};
export default AmenitySelector;
