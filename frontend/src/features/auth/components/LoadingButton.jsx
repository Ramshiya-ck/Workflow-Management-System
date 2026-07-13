import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const LoadingButton = ({ isLoading, children, loadingText = "Processing...", ...props }) => {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading ? (
        <>
          <Loader2 className="animate-spin size-4 shrink-0" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default React.memo(LoadingButton);
