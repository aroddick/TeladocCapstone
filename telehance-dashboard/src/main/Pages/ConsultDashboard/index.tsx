import React, { useEffect } from 'react';
import useSWR from 'swr';
import { useAuth0 } from '@auth0/auth0-react';
import { fetchWithToken } from '../../Util/fetch';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Button, ButtonGroup, Container } from 'react-bootstrap';
import BootstrapTable, { SizePerPageRendererOptions } from 'react-bootstrap-table-next';
import ToolkitProvider, {
  Search,
  CSVExport,
} from 'react-bootstrap-table2-toolkit';
import filterFactory from 'react-bootstrap-table2-filter';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Spinner from 'Components/Spinner';
import getColumns from './getColumns';
import BreadcrumbBar from 'src/main/Components/BreadcrumbBar/BreadcrumbBar';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import './react-bootstrap-table-overrides.css';
import styles from './ConsultDashboard.module.css';

const { SearchBar, ClearSearchButton } = Search;
const { ExportCSVButton } = CSVExport;

const sizePerPageRenderer = ({
  options,
  currentSizePerPage,
  onSizePerPageChange,
}: SizePerPageRendererOptions) => (
  <ButtonGroup>
    {options.map((option) => {
      // @ts-ignore
      const isSelect = currentSizePerPage === option.page;
      return (
        <Button
          key={ option.text }
          variant={isSelect ? 'secondary' : 'warning'}
          // @ts-ignore
          onClick={ () => onSizePerPageChange(option.page) }
        >
          { option.text }
        </Button>
      );
    })}
  </ButtonGroup>
);

const pagination = paginationFactory({
  lastPageText: '>>',
  sizePerPage: 10,
  firstPageText: '<<',
  nextPageText: '>',
  prePageText: '<',
  showTotal: true,
  alwaysShowAllBtns: true,
  sizePerPageRenderer
});

function getRole(consultList: any) {
  if (consultList[0].doctor && consultList[0].patient) return 'ADMIN';
  else if (consultList[0].patient) return 'DOCTOR';
  else return 'PATIENT';
}

function ConsultDashboard({ history }: RouteComponentProps) {
  const { user } = useAuth0();
  const user_id = user ? user.sub.split('|')[1] : 'NULL';
  const awsToken = process.env.REACT_APP_CONSULT_API_KEY;
  const { data: consultList } = useSWR(
    [
      `https://53q2e7vhgl.execute-api.us-west-2.amazonaws.com/dev/consult-get-all?user_id=${user_id}`,
      awsToken,
    ],
    fetchWithToken
  );

  if (!consultList) return <Spinner />;
  if (consultList.length === 0) return <h1>No Consults</h1>; // TODO: Replace with UI Component

  return (
    <>
      <BreadcrumbBar page='Consult Dashboard' />
      <Container className='mb-5 text-center'>
        <ToolkitProvider
          bootstrap4
          keyField='id'
          data={consultList}
          columns={getColumns(history, getRole(consultList))}
          search={{
            searchFormatted: true,
          }}
          exportCSV={{
            onlyExportFiltered: true,
          }}
        >
          {({ searchProps, baseProps, csvProps }) => (
            <>
              <div className={styles.controls}>
                <SearchBar {...searchProps} />
                <ClearSearchButton />
                <ExportCSVButton {...csvProps}>Export to CSV</ExportCSVButton>
              </div>
              <hr />
              <BootstrapTable
                pagination={pagination}
                filter={filterFactory()}
                {...baseProps}
              />
            </>
          )}
        </ToolkitProvider>
      </Container>
    </>
  );
}

export default withRouter(ConsultDashboard);
