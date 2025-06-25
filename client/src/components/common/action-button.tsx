import { ReactNode, forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends ButtonProps {
  icon?: ReactNode;
  tooltip?: string;
  loading?: boolean;
  confirmAction?: boolean;
  confirmMessage?: string;
}

const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    icon, 
    tooltip, 
    loading = false, 
    confirmAction = false, 
    confirmMessage = "Tem certeza?",
    children, 
    onClick,
    className,
    disabled,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmAction) {
        if (window.confirm(confirmMessage)) {
          onClick?.(e);
        }
      } else {
        onClick?.(e);
      }
    };

    const button = (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          loading && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        ) : icon ? (
          <span className="mr-2">{icon}</span>
        ) : null}
        {children}
      </Button>
    );

    if (tooltip && !disabled) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

ActionButton.displayName = "ActionButton";

export default ActionButton;