import {useAuthContext} from '../hooks/useAuthContext';
import {UserProfileBox} from '../layouts/UserProfileBox';
import './DashboardPage.css';
import {VerifyEmailBox} from '../layouts/VerifyEmailBox';
import StatisticsBox from '../layouts/StatisticsBox';
import DashboardTableBox from '../layouts/DashboardTableBox';

export function DashboardPage() {
  document.title = 'Dashboard | UMS';
  const authContext = useAuthContext();

  if (!authContext.authStatus?.isEmailVerified) {
    return (
      <div className="dashboard-page">
        <UserProfileBox />
        <VerifyEmailBox />
      </div>
    );
  }
  return (
    <div className="dashboard-page">
      <UserProfileBox />
      <StatisticsBox />
      <DashboardTableBox />
    </div>
  );
}
