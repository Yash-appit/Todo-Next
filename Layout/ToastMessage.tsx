import { toast } from 'sonner';

interface ToastMessageProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  message: any;
}

const ToastMessage = ({ type = 'success', message }: ToastMessageProps) => {
  return toast[type](message);
};

export default ToastMessage;