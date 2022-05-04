import React, { useContext, useCallback, memo } from 'react';
import { CLICK_MINE, CODE, FLAG_CELL, NORMALIZE_CELL, OPEN_CELL, TableContext } from './context';

const getTdStyle = (code) => {
  switch (code) {
    case CODE.NORMAL:
    case CODE.MINE:
      return {
        background: '#e4e4e4',
      };
    case CODE.CLICKED_MINE:
    case CODE.OPENED:
      return {
        background: '#ffffff',
      };
    case CODE.FLAG_MINE:
    case CODE.FLAG:
      return {
        background: '#ffbebe',
      };
    default:
      return {
        background: '#ffffff',
      };
  }
};

const getTdText = (code) => {
  switch (code) {
    case CODE.NORMAL:
      return '';
    case CODE.MINE:
      return 'X';
    case CODE.CLICKED_MINE:
      return '💣';
    case CODE.FLAG_MINE:
    case CODE.FLAG:
      return '🚩';
    default:
      return code || '';
  }
};


const Td = memo(({ rowIndex, cellIndex }) => {
  // context를 사용하면 기본적으로 전부 다 렌더링이 되기 때문에 이 return 부분은 따로 캐싱해주거나 분리해주면 좋다.
  const { tableData, dispatch, halted } = useContext(TableContext)

  const onClickTd = useCallback(() => {
    if (halted) return;
    switch (tableData[rowIndex][cellIndex]) {
      case CODE.OPENED:
      case CODE.FLAG_MINE:
      case CODE.FLAG:
        return;
      case CODE.NORMAL:
        dispatch({ type: OPEN_CELL, row: rowIndex, cell: cellIndex });
        return;
      case CODE.MINE:
        dispatch({ type: CLICK_MINE, row: rowIndex, cell: cellIndex });
        return;
      default:
        return;
    }
  }, [tableData[rowIndex][cellIndex], halted]);

  const onRightClickTd = useCallback((e) => {
    e.preventDefault();
    if (halted) return;
    /*
      일반 칸 OR 지뢰 칸 -> 깃발 칸
      깃발 칸 -> 일반 칸으로 다시 되돌아감
    */
    switch (tableData[rowIndex][cellIndex]) {
      case CODE.NORMAL:
      case CODE.MINE:
        dispatch({ type: FLAG_CELL, row: rowIndex, cell: cellIndex });
        return;
      case CODE.FLAG_MINE:
      case CODE.FLAG:
        dispatch({ type: NORMALIZE_CELL, row: rowIndex, cell: cellIndex });
        return;
      default:
        return;
    }
  }, [tableData[rowIndex][cellIndex], halted]);

  return <RealTd onClickTd={onClickTd} onRightClickTd={onRightClickTd} data={tableData[rowIndex][cellIndex]} />;
});

const RealTd = memo(({ onClickTd, onRightClickTd, data }) => {
  return (
    <td
      style={getTdStyle(data)}
      onClick={onClickTd}
      onContextMenu={onRightClickTd}
    >{getTdText(data)}</td>
  )
})

export default Td;