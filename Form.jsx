import React, { useState, useCallback, useContext, memo } from 'react';
import { TableContext, START_GAME } from './context';
import { Input, Label, CenterItem, Btn } from './commonCss';

const useInput = (init) => {
  const [value, setValue] = useState(init);
  const onChange = (e) => setValue(e.target.value);
  return { value, onChange }
};

const Form = memo(() => {
  const row = useInput(8);
  const cell = useInput(8);
  const mine = useInput(12);
  const { tableData, dispatch } = useContext(TableContext);
  if (!Boolean(tableData.length)) dispatch({ type: START_GAME, row: row.value, cell: cell.value, mine: mine.value });

  const onClickStart = useCallback((e) => {
    dispatch({ type: START_GAME, row: row.value, cell: cell.value, mine: mine.value });
  }, [row.value, cell.value, mine.value]);

  return (
    <div style={CenterItem} className='inputWrap'>
      <label style={Label} htmlFor='row'>세로</label>
      <input style={{ ...Input, width: '50px' }} id='row' type='number' placeholder='세로' {...row} />
      <label style={Label} htmlFor='cell'>가로</label>
      <input style={{ ...Input, width: '50px' }} id='cell' type='number' placeholder='가로' {...cell} />
      <label style={Label} htmlFor='mine'>지뢰</label>
      <input style={{ ...Input, width: '50px' }} id='mine' type='number' placeholder='지뢰' {...mine} />
      <button style={Btn} onClick={onClickStart}>다시시작</button>
    </div>
  );
});

export default Form;