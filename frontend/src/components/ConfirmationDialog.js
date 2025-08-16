import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./Button";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // "danger" | "warning" | "default"
  isLoading = false
}) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Let the parent handle the error, don't close dialog
      console.error("Confirmation action failed:", error);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-red-600",
          confirmButton: "bg-red-600 hover:bg-red-700 text-white"
        };
      case "warning":
        return {
          icon: "text-yellow-600",
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white"
        };
      default:
        return {
          icon: "text-blue-600",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md z-50">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 ${styles.icon}`}>
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </Dialog.Title>
              
              <Dialog.Description className="text-gray-600 text-sm mb-6">
                {message}
              </Dialog.Description>

              <div className="flex justify-end gap-3">
                <Dialog.Close asChild>
                  <Button 
                    variant="outline"
                    disabled={isLoading}
                  >
                    {cancelText}
                  </Button>
                </Dialog.Close>
                
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={styles.confirmButton}
                >
                  {isLoading ? "Processing..." : confirmText}
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}