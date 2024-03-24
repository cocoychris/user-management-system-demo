import {Message} from '../components/Message';
import './NotFoundPage.css';

export function NotFoundPage() {  
  document.title = 'Not Found | UMS';
  return (
    <section className="not-found-page">
      <div className="container">
        <Message type="error" message={'Page Not Found'} />
      </div>
    </section>
  );
}
