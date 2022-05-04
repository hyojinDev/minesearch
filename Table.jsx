import React, { useContext, memo } from 'react';
import { TableContext } from './context';
import Tr from './Tr';

const Table = memo(() => {
  const { tableData } = useContext(TableContext);

  return (
    <table>
      {Array(tableData.length).fill().map((tr, i) => <Tr rowIndex={i} key={i} />)}
    </table>
  );
});

export default Table;