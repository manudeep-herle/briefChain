import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "text-white hover:opacity-90 focus:ring-2 focus:ring-blue-500" + " " + "bg-[#3b82f6]",
        destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500",
        outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2" + " " + "focus:ring-[#3b82f6]",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500",
        link: "underline-offset-4 hover:underline focus:ring-2" + " " + "text-[#3b82f6] focus:ring-[#3b82f6]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 py-1 text-sm",
        lg: "h-10 px-6 py-2 text-base",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
