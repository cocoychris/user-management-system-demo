import './Message.css';
export interface MessageProps {
  type?: 'error' | 'info' | 'success';
  message?: string | JSX.Element;
}
const EMOJI_MAP = {
  error: '❌ ',
  info: '',
  success: '✔️ ',
};
export function Message({type = 'info', message = ''}: MessageProps) {
  if (!message) {
    return null;
  }
  return (
    <div className={['message', type].join(' ')}>
      {EMOJI_MAP[type]}
      {message}
    </div>
  );
}
