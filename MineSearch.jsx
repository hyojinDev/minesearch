import React, { useEffect, useReducer, useMemo } from 'react';
import Form from './Form';
import Table from './Table';
import { Strong } from './commonCss';
import { TableContext, INCREMENT_TIMER, reducer } from './context';

const initialState = {
  tableData: [],
  data: {
    row: 0,
    cell: 0,
    mine: 0,
  },
  result: '',
  halted: false,
  openedCount: 0,
  mineCount: 0,
  isClicked: false,
  timer: 0,
  record: [],
};

const MineSearch = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { tableData, halted, result, mineCount, timer, isClicked, record } = state;
  const value = useMemo(() => ({ tableData: tableData, halted: halted, dispatch }), [tableData, halted]);

  useEffect(() => {
    let timer;
    if (isClicked) {
      timer = setInterval(() => {
        dispatch({ type: INCREMENT_TIMER });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    }
  }, [isClicked]);

  return (
    <TableContext.Provider value={value}>
      <Form />
      <strong style={Strong}>{`시간 : ${timer}초`}</strong>
      <strong style={Strong}>{`남은 지뢰 : ${mineCount}`}</strong>
      <Table />
      {halted && (<p>{result}</p>)}
      <div>
        <strong style={{ ...Strong, margin: '2rem 0' }}>기록</strong>
        {Boolean(record.length) && record.sort((a, b) => a - b).map((v, i) => <strong style={Strong}>{`${i + 1}등 : ${v}초`}</strong>)}
      </div>
    </TableContext.Provider>
  );
};

export default MineSearch;