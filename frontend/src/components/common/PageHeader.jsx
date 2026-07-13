import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

/**
 * Reusable top title bar housing navigation breadcrumbs and workflow action triggers.
 */
const PageHeader = ({ title, subtitle, breadcrumbs, primaryAction, secondaryAction }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-200/60 font-sans select-none">
      <div className="space-y-1">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <nav className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="size-3.5" />}
                {crumb.path ? (
                  <Link to={crumb.path} className="hover:text-zinc-600 transition-colors">
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-zinc-500 font-bold">{crumb.name}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-400 font-semibold leading-relaxed">{subtitle}</p>}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          {secondaryAction}
          {primaryAction}
        </div>
      )}
    </div>
  );
};

export default React.memo(PageHeader);
