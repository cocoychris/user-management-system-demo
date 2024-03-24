import {Divider} from '@mui/material';
import Box from '../components/Box';
import './StatisticsBox.css';
import {useEffect, useState} from 'react';
import {userApi} from '../utils/api';
import {Message, MessageProps} from '../components/Message';
import {GetStatistics200Response, ResponseError} from '../openapi';
import {assertIsError} from '../utils/error';
import {SEC} from '../utils/time';

const UPDATE_INTERVAL_SEC = 15;
export default function StatisticsBox() {
  const [statistics, setStatistics] = useState<GetStatistics200Response | null>(
    null
  );
  const [messageProps, setMessageProps] = useState<MessageProps>({});
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    const getStatistics = async () => {
      try {
        setMessageProps({type: 'info', message: 'Loading...'});
        // Just for testing
        // if (Math.random() < 0.5) {
        //   throw new ResponseError(
        //     new Response(JSON.stringify({
        //       message: 'Internal Server Error',
        //     }), {status: 500})
        //   );
        // }
        const data = await userApi.getStatistics();
        setStatistics(data);
        if (!intervalId) {
          intervalId = setInterval(
            getStatistics,
            UPDATE_INTERVAL_SEC * SEC.IN_MS
          );
        }
      } catch (error) {
        assertIsError(error, ResponseError);
        const data = await error.response.json();
        setStatistics(null);
        setMessageProps({
          type: 'error',
          message: `Failed to get statistics: ${
            data.message || error.response.statusText
          }`,
        });
      }
    };
    getStatistics();
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (!statistics) {
    return (
      <Box className="dashboard-statistics-box" direction="column">
        <Message {...messageProps} />
      </Box>
    );
  }
  return (
    <Box className="dashboard-statistics-box" direction="column">
      <div className="statistics-container">
        <div className="statistics-item">
          <h1>Signed Up Users</h1>
          <h2>All Time</h2>
          <div className="statistics-item-value">{statistics.totalUsers}</div>
          <p>
            Users who have signed up either by creating an account with an email
            and password or by using Google OAuth.
          </p>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className="statistics-item">
          <h1>Daily Active Users</h1>
          <h2>Today</h2>
          <div className="statistics-item-value">
            {statistics.activeUsersToday}
          </div>
          <p>
            Users who have logged in (or authenticated with cookies) in the past
            24 hours, starting from{' '}
            {new Date(statistics.todayBeginDateTime).toLocaleString()}.
          </p>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className="statistics-item">
          <h1>Daily Active Users</h1>
          <h2>This Week</h2>
          <div className="statistics-item-value">
            {statistics.averageActiveUsersLast7Days}
          </div>
          <p>
            Average number of users per day who have logged in (or authenticated
            with cookies) over the past 7 days, starting from{' '}
            {new Date(statistics.sevenDaysAgoDateTime).toLocaleString()}.
          </p>
        </div>
      </div>
      <span className="statistics-last-updated">
        Last updated at {new Date().toLocaleString()}
        <br />
        Statistics are updated every {UPDATE_INTERVAL_SEC} seconds.
      </span>
    </Box>
  );
}
