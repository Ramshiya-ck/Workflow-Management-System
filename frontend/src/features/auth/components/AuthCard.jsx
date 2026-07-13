import React from "react";

const AuthCard = ({ children }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 sm:p-8 transition-all duration-300">
      {children}
    </div>
  );
};

export default React.memo(AuthCard);
