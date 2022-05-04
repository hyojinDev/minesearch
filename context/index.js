import React, { createContext } from 'react';

export const TableContext = createContext({
  tableData: [],
  mine: 0,
  halted: false,
  dispatch: () => { },
});


export const CODE = {
  OPENED: 0,  // 0 이상이면 모두 opened
  NORMAL: -1,
  QUESTION: -2,
  FLAG: -3,
  FLAG_MINE: -5,
  CLICKED_MINE: -6,
  MINE: -7,
};

export const START_GAME = 'START_GAME';
export const OPEN_CELL = 'OPEN_CELL';
export const CLICK_MINE = 'CLICK_MINE';
export const FLAG_CELL = 'FLAG_CELL';
export const NORMALIZE_CELL = 'NORMALIZE_CELL';
export const INCREMENT_TIMER = 'INCREMENT_TIMER';

const plantMine = (row, cell, mine) => {
  console.log(row, cell, mine);
  const candidate = Array(row * cell).fill().map((arr, i) => {
    return i;
  });
  const shuffle = [];
  // 0 ~ 99 칸들 중에 지뢰 개수만큼 랜덤으로 뽑아놓기
  while (candidate.length > row * cell - mine) {
    const chosen = candidate.splice(Math.floor(Math.random() * candidate.length), 1)[0];
    shuffle.push(chosen);
  };

  // 2차원 배열 만들어서 테이블 데이터 만들기
  const data = [];
  for (let i = 0; i < row; i++) {
    const rowData = [];
    data.push(rowData);
    for (let j = 0; j < cell; j++) {
      rowData.push(CODE.NORMAL)
    }
  };

  for (let k = 0; k < shuffle.length; k++) {
    const ver = Math.floor(shuffle[k] / cell);
    const hor = shuffle[k] % cell;
    data[ver][hor] = CODE.MINE;
  };
  return data;
}

export const reducer = (state, action) => {
  switch (action.type) {
    case START_GAME:
      return {
        ...state,
        data: {
          row: action.row,
          cell: action.cell,
          mine: action.mine
        },
        openedCount: 0,
        mineCount: action.mine,
        tableData: plantMine(action.row, action.cell, action.mine),
        halted: false,
        isClicked: false,
        timer: 0,
        record: state.record || []
      };
    case OPEN_CELL: {
      const tableData = [...state.tableData];
      // 불변성을 위해서 모든 칸을 새로 만듬
      tableData.forEach((row, i) => {
        tableData[i] = [...row];
      });

      // 내 기준으로 검사하는 함수
      const checked = [];
      let openedCount = 0;
      const checkAround = (row, cell) => {
        // 상하좌우 없는 칸은 안 열기
        if (row < 0 || row >= tableData.length || cell < 0 || cell >= tableData[0].length) { return };
        // 닫힌 칸만 열기
        if ([CODE.OPENED, CODE.FLAG, CODE.FLAG_MINE].includes(tableData[row][cell])) { return };

        if (checked.includes(`${row}/${cell}`)) { // 이미 검사한 칸이면 return 해주어야 무한루프가 일어나지 않는다.
          return;
        } else {
          // 한 번 연칸은 무시하기
          checked.push(`${row}/${cell}`)
        }

        let around = [tableData[row][cell - 1], tableData[row][cell + 1]]; // 내 양 옆 두칸도 검사 대상에 넣어주기

        // start 주변 지뢰 갯수를 검사 
        if (tableData[row - 1]) {  // 나의 윗 줄이 있는 경우
          around = around.concat(
            tableData[row - 1][cell - 1],
            tableData[row - 1][cell],
            tableData[row - 1][cell + 1]
          );
        }

        if (tableData[row + 1]) {   // 나의 아랫 줄이 있는 경우
          around = around.concat(
            tableData[row + 1][cell - 1],
            tableData[row + 1][cell],
            tableData[row + 1][cell + 1]
          );
        }

        const count = around.filter((v) => [CODE.MINE, CODE.FLAG_MINE].includes(v)).length;
        // end 주변 지뢰 갯수 검사 파악완료

        // start 내가 빈칸이면 주변 칸 오픈
        if (count === 0) {
          if (row > -1) {
            const near = [];
            if (row - 1 > -1) {
              near.push([row - 1, cell - 1]);
              near.push([row - 1, cell]);
              near.push([row - 1, cell + 1]);
            }
            near.push([row, cell - 1]);
            near.push([row, cell + 1]);
            if (row + 1 < tableData.length) {  // 제일 아랫칸을 클릭한 경우
              near.push([row + 1, cell - 1]);
              near.push([row + 1, cell]);
              near.push([row + 1, cell + 1]);
            }
            near.forEach((n) => {
              if (tableData[n[0]][n[1]] !== CODE.OPENED) { // 주변 칸들이 이미 오픈한 칸이 아닐 경우에만 재귀 실행
                checkAround(n[0], n[1]);
              }
            })
          }
        }
        // 내 칸이 닫힌 칸이면 카운트 증가
        if (tableData[row][cell] === CODE.NORMAL) {
          openedCount += 1;
        }
        tableData[row][cell] = count;
      }
      checkAround(action.row, action.cell);
      let halted = false;
      let result = '';
      let isClicked = true;
      let record = [...state.record];
      // 게임 종료 체크
      if (state.data.row * state.data.cell - state.data.mine === state.openedCount + openedCount) {
        record = record.concat(state.timer);
        halted = true;
        isClicked = false;
        result = '게임이 종료되었습니다. 다시 시작해 주세요.';
      }
      console.log('일반', record)
      return {
        ...state,
        tableData,
        openedCount: state.openedCount + openedCount,
        halted,
        result,
        isClicked,
        record
      };
    }
    case CLICK_MINE: {
      // 지뢰를 클릭한 경우
      const tableData = [...state.tableData];
      tableData[action.row] = [...state.tableData[action.row]];
      tableData[action.row][action.cell] = CODE.CLICKED_MINE;
      return {
        ...state,
        tableData,
        halted: true,
        isClicked: false,
        result: '게임이 종료되었습니다. 다시 시작해 주세요.',
        record: state.record.concat(state.timer)
      }
    }
    case FLAG_CELL: {
      // 깃발을 꽂을 경우
      const tableData = [...state.tableData];
      let mineCount = state.mineCount;
      let halted = false;
      let result = '';
      let isClicked = true;
      let record = [...state.record];
      if (mineCount !== 0) {
        mineCount = mineCount - 1;
      }
      tableData[action.row] = [...state.tableData[action.row]];

      if (tableData[action.row][action.cell] === CODE.MINE) {
        // 깃발을 꽂을 칸이 지뢰가 있는 칸이면 
        tableData[action.row][action.cell] = CODE.FLAG_MINE;
      } else {
        tableData[action.row][action.cell] = CODE.FLAG;
      }

      // 게임 종료 체크
      if (state.data.row * state.data.cell - state.data.mine === state.openedCount + 1 || mineCount === 0) {
        record = record.concat(state.timer);
        halted = true;
        isClicked = false;
        result = '게임이 종료되었습니다. 다시 시작해 주세요.';
      }
      return {
        ...state,
        tableData,
        mineCount,
        openedCount: state.openedCount + 1,
        halted,
        result,
        isClicked,
        record
      }
    }
    case NORMALIZE_CELL: {
      // 기본 칸으로 바꾸는 곳
      const tableData = [...state.tableData];
      let mineCount = state.mineCount;
      tableData[action.row] = [...state.tableData[action.row]];
      mineCount = mineCount + 1;
      if (tableData[action.row][action.cell] === CODE.FLAG_MINE) {
        tableData[action.row][action.cell] = CODE.MINE;
      } else {
        tableData[action.row][action.cell] = CODE.NORMAL;
      }
      return {
        ...state,
        mineCount,
        openedCount: state.openedCount - 1,
        tableData,
      }
    }
    case INCREMENT_TIMER: {
      return {
        ...state,
        timer: state.timer + 1,
      }
    }
    default:
      return state;
  }
};