import './Message.css';
export interface MessageProps {
  type?: 'error' | 'info' | 'success';
  message?: string | JSX.Element;
}
export function Message({
  type = 'info',
  message = '',
}: MessageProps) {
  if (!message) {
    return null;
  }
  const classNameList = ['message', type];
  return <div className={classNameList.join(' ')}>{message}</div>;
}
