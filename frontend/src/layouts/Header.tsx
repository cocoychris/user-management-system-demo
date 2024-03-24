import './Header.css';
import UMS from '../assets/ums_logo.svg';
export function Header() {
  return (
    <header>
      <img src={UMS} alt="UMS" width={80} height={80} />
      <h1>User Management System</h1>
    </header>
  );
}