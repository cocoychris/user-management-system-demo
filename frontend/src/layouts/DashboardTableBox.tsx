import {useEffect, useState} from 'react';
import Box from '../components/Box';
import {
  ErrorSchema,
  GetAllUsers200Response,
  ResponseError,
  UserProfile,
} from '../openapi';
import './DashboardTableBox.css';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {userApi} from '../utils/api';
import {Message, MessageProps} from '../components/Message';
import {assertIsError} from '../utils/error';
import {Button} from '@mui/material';
import {useAuthContext} from '../hooks/useAuthContext';

const columns: GridColDef<UserProfile>[] = [
  {field: 'id', headerName: 'ID', width: 40},
  {
    field: 'name',
    headerName: 'Name',
    description: 'Display name of the user',
    type: 'string',
    width: 100,
    editable: false,
  },
  {
    field: 'email',
    headerName: 'Email',
    description: 'Email address of the user',
    type: 'string',
    width: 190,
    editable: false,
  },
  {
    field: 'loginCount',
    headerName: 'Login Count',
    description: 'Number of times the user has logged in',
    type: 'number',
    width: 80,
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    description: 'The time the user was created',
    type: 'dateTime',
    width: 170,
    editable: true,
  },
  {
    field: 'lastActiveAt',
    headerName: 'Last Active At',
    description:
      'The last time the user logged in or authenticated with a cookie',
    type: 'dateTime',
    width: 170,
  },
];

export default function DashboardTableBox() {
  const authContext = useAuthContext();
  const [rows, setRows] = useState<UserProfile[] | null>(null);
  const [messageProps, setMessageProps] = useState<MessageProps>({
    type: 'info',
    message: 'Waiting for user profile...',
  });
  const getRows = async () => {
    try {
      setMessageProps({type: 'info', message: 'Loading...'});
      // Just for testing
      //   if (Math.random() < 0.5) {
      //     throw new ResponseError(
      //       new Response(JSON.stringify({
      //         message: 'Internal Server Error',
      //       }), {status: 500})
      //     );
      //   }
      const data: GetAllUsers200Response = await userApi.getAllUsers();
      setMessageProps({});
      setRows(data.userProfileList);
    } catch (error) {
      assertIsError(error);
      let message: string = error.message;
      if (error instanceof ResponseError) {
        const data = (await error.response.json()) as ErrorSchema;
        message = data.message || error.response.statusText;
      }
      setMessageProps({
        type: 'error',
        message:`Failed to get user list. ${message}`,
      });
      setRows(null);
    }
  };
  useEffect(() => {
    // Wait for the user profile to be loaded before fetching the data.
    // This is because the `lastActiveAt` field in the data will be updated after the user profile is loaded.
    // We might get the old `lastActiveAt` value if we fetch the data before the user profile is loaded.
    if (!authContext.userProfile) {
      return;
    }
    if (rows) {
      return;
    }
    getRows();
    // No need to add rows to the dependency array. It will only cause infinite loop.
    // eslint-disable-next-line
  }, [authContext]);

  if (!rows) {
    return (
      <Box className="dashboard-table-box" direction="column">
        <Message {...messageProps} />
        <Button
          className="refresh-button"
          variant="contained"
          color="primary"
          onClick={getRows}
        >
          Refresh
        </Button>
      </Box>
    );
  }
  return (
    <Box className="dashboard-table-box">
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        pageSizeOptions={[10]}
        disableRowSelectionOnClick
      />
      <span className="table-last-updated">
        Last updated at {new Date().toLocaleString()}
      </span>
      <Button
        className="refresh-button"
        variant="contained"
        color="primary"
        onClick={getRows}
      >
        Refresh
      </Button>
    </Box>
  );
}
