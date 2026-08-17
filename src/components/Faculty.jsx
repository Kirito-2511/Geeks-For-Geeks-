import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { sanitizeUrl } from '../utils/sanitize';

export default function Faculty() {
  const { data } = useContext(DataContext);
  const { faculty, content } = data;
  const [selectedMember, setSelectedMember] = useState(null);

  const octagonStyle = { clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' };

  return (
    <section id="faculty" className="border-b border-brand/10 relative">
      {/* Section header */}
      <div className="px-6 md:px-10 max-w-[1400px] mx-auto pt-20 pb-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand/40 mb-4 whitespace-pre-line">
          {content.facultyLabel || 'Faculty'}
        </p>
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-brand leading-[0.9] whitespace-pre-line">
          {content.facultyHeadline || 'FACULTY'}
        </h2>
      </div>

      {/* FACULTY Section */}
      <div className="border-t border-brand/10">
        {(!faculty || faculty.length === 0) ? (
          <div className="max-w-[1400px] mx-auto px-6 py-16 text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-brand/40">
              No faculty profiles added yet. Add them in the Admin console.
            </p>
          </div>
        ) : (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-16 grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-12 justify-items-center">
            {faculty.map((member, i) => {
              return (
                <div 
                  key={member.id} 
                  className="flex flex-col items-center group w-full max-w-[160px] sm:max-w-[200px] md:w-auto cursor-pointer"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="transition-transform duration-500 mb-3 sm:mb-6 flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
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
                  <div className="text-center">
                    <p className="font-black uppercase tracking-tighter text-brand mb-1 transition-colors group-hover:text-accent text-base sm:text-2xl md:text-3xl">
                      {member.name}
                    </p>
                    <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 border border-brand/20 text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-brand/60 group-hover:border-accent/40 transition-colors">
                      {member.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
                {sanitizeUrl(selectedMember.linkedin) && (
                  <a href={sanitizeUrl(selectedMember.linkedin)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-brand hover:text-accent transition-colors">
                    [LINKEDIN]
                  </a>
                )}
                {sanitizeUrl(selectedMember.github) && (
                  <a href={sanitizeUrl(selectedMember.github)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-brand hover:text-accent transition-colors">
                    [GITHUB]
                  </a>
                )}
                {sanitizeUrl(selectedMember.instagram) && (
                  <a href={sanitizeUrl(selectedMember.instagram)} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-brand hover:text-accent transition-colors">
                    [INSTAGRAM]
                  </a>
                )}
                {selectedMember.email && (
                  <a href={sanitizeUrl(`mailto:${selectedMember.email}`)} className="text-xs font-bold uppercase tracking-widest text-brand hover:text-accent transition-colors">
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
