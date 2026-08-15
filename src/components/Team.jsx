import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';

export default function Team() {
  const { data } = useContext(DataContext);
  const { team, content } = data;
  const [selectedMember, setSelectedMember] = useState(null);

  const coreTeam = team.filter(m => m.level === 'CORE TEAM');
  const heads = team.filter(m => m.level === 'HEADS');
  const coHeads = team.filter(m => m.level === 'CO-HEADS');
  const members = team.filter(m => m.level === 'MEMBERS');

  const octagonStyle = { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' };

  return (
    <section id="team" className="border-b border-brand/10 relative">
      {/* Section header */}
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto pt-20 pb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
          {content.teamLabel}
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand leading-[0.9] whitespace-pre-line">
          CORE TEAM
        </h2>
      </div>

      {/* CORE TEAM Section */}
      {coreTeam.length > 0 && (
        <div className="border-t border-brand/10">
          <div className="max-w-[1400px] mx-auto px-6 py-16 flex flex-wrap justify-center items-center gap-10">
            {coreTeam.map((member, i) => {
              const isCenter = coreTeam.length === 3 && i === 1;
              return (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center group cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className={`transition-transform duration-500 mb-6 flex items-center justify-center ${isCenter ? 'w-40 h-40 sm:w-48 sm:h-48 scale-105 sm:scale-110 z-10' : 'w-24 h-24 sm:w-32 sm:h-32'}`}>
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        style={octagonStyle} 
                      />
                    ) : (
                      <img 
                        src="/default-avatar.png"
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-50 grayscale"
                        style={octagonStyle}
                      />
                    )}
                  </div>
                  <div className={`text-center ${isCenter ? 'mt-2 sm:mt-4' : ''}`}>
                    <p className={`font-black uppercase tracking-tighter text-brand mb-1 transition-colors group-hover:text-accent ${isCenter ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
                      {member.name}
                    </p>
                    <span className="inline-block px-3 py-1 border border-brand/20 text-[10px] font-bold uppercase tracking-[0.2em] text-brand/60 group-hover:border-accent/40 transition-colors">
                      {member.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HEADS Section */}
      {heads.length > 0 && (
        <div className="border-t border-brand/10">
          <div className="px-6 md:px-10 max-w-[1400px] mx-auto py-12">
            <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-brand mb-10 text-center">
              HEADS
            </h3>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
              {heads.map(member => (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center group w-[140px] sm:w-[180px] cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 flex items-center justify-center">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        style={octagonStyle} 
                      />
                    ) : (
                      <img src="/default-avatar.png" alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-50 grayscale" style={octagonStyle} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black uppercase tracking-tighter text-brand mb-1 transition-colors group-hover:text-accent">
                      {member.name}
                    </p>
                    <span className="inline-block px-2 py-0.5 border border-brand/20 text-[9px] font-bold uppercase tracking-[0.2em] text-brand/60 group-hover:border-accent/40 transition-colors">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CO-HEADS Section */}
      {coHeads.length > 0 && (
        <div className="border-t border-brand/10">
          <div className="px-6 md:px-10 max-w-[1400px] mx-auto py-12">
            <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-brand mb-10 text-center">
              CO-HEADS
            </h3>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {coHeads.map(member => (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center group w-[120px] sm:w-[160px] cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="w-20 h-20 sm:w-28 sm:h-28 mb-5 flex items-center justify-center">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        style={octagonStyle} 
                      />
                    ) : (
                      <img src="/default-avatar.png" alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-50 grayscale" style={octagonStyle} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black uppercase tracking-tighter text-brand mb-1 transition-colors group-hover:text-accent">
                      {member.name}
                    </p>
                    <span className="inline-block px-2 py-0.5 border border-brand/20 text-[9px] font-bold uppercase tracking-[0.2em] text-brand/60 group-hover:border-accent/40 transition-colors">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS Section */}
      {members.length > 0 && (
        <div className="border-t border-brand/10">
          <div className="px-6 md:px-10 max-w-[1400px] mx-auto py-12">
            <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-brand mb-10 text-center">
              MEMBERS
            </h3>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              {members.map(member => (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center group w-[100px] sm:w-[140px] cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mb-4 flex items-center justify-center">
                    {member.image ? (
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        style={octagonStyle} 
                      />
                    ) : (
                      <img src="/default-avatar.png" alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-50 grayscale" style={octagonStyle} />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-base font-black uppercase tracking-tighter text-brand mb-1 transition-colors group-hover:text-accent">
                      {member.name}
                    </p>
                    <span className="inline-block px-2 py-0.5 border border-brand/20 text-[9px] font-bold uppercase tracking-[0.2em] text-brand/60 group-hover:border-accent/40 transition-colors">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-canvas/80 backdrop-blur-md">
          {/* Backdrop Click to close */}
          <div className="absolute inset-0" onClick={() => setSelectedMember(null)} />
          
          <div className="relative w-full max-w-2xl bg-canvas border border-brand shadow-2xl p-8 sm:p-12 flex flex-col sm:flex-row gap-8 items-start animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 text-brand/40 hover:text-brand text-2xl font-black transition-colors"
            >
              ×
            </button>
            
            {/* Left: Image */}
            <div className="w-32 h-32 sm:w-48 sm:h-48 shrink-0 mx-auto sm:mx-0">
              {selectedMember.image ? (
                <img 
                  src={selectedMember.image} 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover" 
                  style={octagonStyle} 
                />
              ) : (
                <img 
                  src="/default-avatar.png" 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover opacity-50 grayscale" 
                  style={octagonStyle} 
                />
              )}
            </div>

            {/* Right: Info */}
            <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left">
              <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-brand mb-2">
                {selectedMember.name}
              </h3>
              
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-6">
                <span className="inline-block px-3 py-1 border border-brand bg-brand text-canvas text-[10px] font-bold uppercase tracking-[0.2em]">
                  {selectedMember.role}
                </span>
                {selectedMember.branch && (
                  <span className="inline-block px-3 py-1 border border-brand/20 text-brand text-[10px] font-bold uppercase tracking-[0.2em]">
                    {selectedMember.branch}
                  </span>
                )}
                {selectedMember.domain && (
                  <span className="inline-block px-3 py-1 border border-brand/20 text-brand text-[10px] font-bold uppercase tracking-[0.2em]">
                    {selectedMember.domain}
                  </span>
                )}
              </div>

              {selectedMember.description && (
                <p className="text-brand/80 text-sm sm:text-base mb-8 leading-relaxed max-w-md">
                  {selectedMember.description}
                </p>
              )}

              {/* Social / Contact Links */}
              <div className="flex flex-wrap gap-6 justify-center sm:justify-start mt-auto">
                {selectedMember.linkedin && (
                  <a href={selectedMember.linkedin} target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-brand hover:text-accent transition-colors">
                    [LINKEDIN]
                  </a>
                )}
                {selectedMember.github && (
                  <a href={selectedMember.github} target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-widest text-brand hover:text-accent transition-colors">
                    [GITHUB]
                  </a>
                )}
                {selectedMember.email && (
                  <a href={`mailto:${selectedMember.email}`} className="text-xs font-bold uppercase tracking-widest text-brand hover:text-accent transition-colors">
                    [EMAIL]
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
