import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function MiningBillboard({ actionText, onClickOverride }: { actionText?: string, onClickOverride?: () => void }) {
  const navigate = useNavigate();

  const handleClick = () => {
      if (onClickOverride) {
          onClickOverride();
      } else {
          navigate('/mining');
      }
  };

  return (
    <div className="relative rounded-[2rem] overflow-hidden bg-black border border-red-500/30 group h-52 flex cursor-pointer" onClick={handleClick}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black"></div>
      
      <div className="absolute top-0 left-0 w-[55%] h-full flex items-center z-10">
         <div className="absolute top-0 left-0 w-32 h-full bg-[#0a0a0a] border-r-2 border-red-900/50" style={{ clipPath: 'polygon(0 0, 100% 0%, 75% 20%, 95% 45%, 65% 65%, 85% 80%, 45% 100%, 0 100%)' }}></div>
         
         <motion.div 
           animate={{ opacity: [0.15, 0.4, 0.15] }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-1/2 left-28 w-40 h-32 -translate-y-1/2 bg-gradient-to-r from-[rgba(255,255,255,0.2)] to-transparent pointer-events-none" 
           style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)' }}
         ></motion.div>

         <motion.div
           animate={{ rotate: [-8, 15, -8], x: [0, 6, 0] }}
           transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
           className="absolute top-1/2 left-[5rem] -translate-y-[40%] origin-bottom-right"
         >
            <div className="text-5xl filter drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] relative z-10">
              🐱
               <div className="absolute top-[-10px] right-[-15px] text-4xl rotate-[15deg]">⛏️</div>
            </div>
         </motion.div>
         
         <div className="absolute top-1/2 left-32">
           {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  x: [0, Math.random() * 40 + 20], 
                  y: [0, (Math.random() - 0.5) * 60], 
                  opacity: [1, 1, 0],
                  scale: [1, 0]
                }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                className="absolute w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_5px_rgba(255,0,0,1)]"
              />
           ))}
         </div>
      </div>

      <div className="absolute top-0 right-[-15px] w-1/2 h-full flex items-center justify-center z-10">
          <motion.div 
             animate={{ y: [-6, 6, -6] }}
             transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
             className="relative z-10 w-[110px] h-[110px] rounded-full bg-gradient-to-br from-[#FF0013] to-[#8B0000] border-2 border-[#FF0013] shadow-[0_0_40px_rgba(255,0,0,0.6)] flex items-center justify-center transform -rotate-12"
           >
              <div className="w-[85%] h-[85%] rounded-full border border-red-400/50 bg-gradient-to-tr from-[#CC000F] to-[#5a0000] flex items-center justify-center relative overflow-hidden shadow-inner">
                 <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none"></div>
                 <div className="w-[50%] h-[50%] border-[2px] border-white rotate-45 flex flex-col justify-between p-[1px]">
                    <div className="w-full h-1/2 border-b-[2px] border-white"></div>
                 </div>
              </div>
          </motion.div>

          <motion.div 
             animate={{ y: [4, -4, 4], x: [0, -5, 0], rotate: 15 }}
             transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
             className="absolute top-8 left-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF0013] to-[#8B0000] border border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)] flex items-center justify-center blur-[0.5px]"
           >
              <div className="w-[80%] h-[80%] rounded-full border-[0.5px] border-red-400 bg-gradient-to-tr from-[#CC000F] to-[#5a0000] flex items-center justify-center">
                 <div className="w-[50%] h-[50%] border border-white rotate-45"></div>
              </div>
          </motion.div>
          
          <motion.div 
             animate={{ y: [-5, 5, -5], x: [0, 8, 0], rotate: -20 }}
             transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
             className="absolute bottom-6 left-6 w-10 h-10 rounded-full bg-gradient-to-br from-[#FF0013] to-[#8B0000] border border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.5)] flex items-center justify-center blur-[0.5px]"
           >
              <div className="w-[80%] h-[80%] rounded-full border-[0.5px] border-red-400 bg-gradient-to-tr from-[#CC000F] to-[#5a0000] flex items-center justify-center">
                 <div className="w-[50%] h-[50%] border border-white rotate-45"></div>
              </div>
          </motion.div>
          
          <motion.div 
             animate={{ y: [3, -3, 3] }}
             transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
             className="absolute top-10 right-2 w-3 h-3 rounded-full bg-[#fbbc05] shadow-[0_0_10px_rgba(251,188,5,0.8)]"
           />
          <motion.div 
             animate={{ y: [-3, 3, -3] }}
             transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
             className="absolute bottom-10 right-4 w-2 h-2 rounded-full bg-[#fbbc05] shadow-[0_0_8px_rgba(251,188,5,0.8)]"
           />
          <motion.div 
             animate={{ y: [2, -2, 2] }}
             transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
             className="absolute top-1/2 left-[-10px] w-2.5 h-2.5 rounded-full bg-[#fbbc05] shadow-[0_0_8px_rgba(251,188,5,0.8)]"
           />
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="px-4 py-1 bg-gradient-to-r from-red-600 to-[#CC000F] rounded-full text-white text-[10px] uppercase tracking-wider font-black shadow-[0_0_15px_rgba(255,0,19,0.5)] border border-red-400/50">
          {actionText || 'Start Mining'}
        </div>
      </div>
    </div>
  );
}
