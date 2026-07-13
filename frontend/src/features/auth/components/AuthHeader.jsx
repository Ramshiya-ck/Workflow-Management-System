import React from "react";

const AuthHeader = ({ title, description }) => {
  return (
    <div className="mb-6 select-none">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 leading-tight">{title}</h1>
      {description && <p className="text-sm text-zinc-500 mt-1.5 leading-relaxed">{description}</p>}
    </div>
  );
};

export default React.memo(AuthHeader);
