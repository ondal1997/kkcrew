// index.js

import { google } from 'googleapis';

// 인증 정보 설정
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // 다운로드한 서비스 계정 키 파일 경로
  scopes: ['https://www.googleapis.com/auth/spreadsheets'], // API 범위
});

// 구글 시트 API 클라이언트 생성
const sheets = google.sheets({ version: 'v4', auth });

// 🚨 수정할 정보 🚨
const SPREADSHEET_ID = '1nhUU7h6EsJFj2f0hzAgPCCk6wgSHGBnbXZ2SOBuaA2w';

/*
  스프레드시트 ID는 시트 URL에서 확인할 수 있습니다.
  예: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
*/


/**
 * 데이터 조회 함수
 */
async function readData() {
  try {
    const range = '사람'; // 조회할 시트 이름과 범위
    console.log(`\n📄 '${range}' 범위에서 데이터 조회 중...`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      console.log('조회된 데이터:');
      rows.forEach(row => {
        console.log(row.join(', '));
      });
    } else {
      console.log('데이터가 없습니다.');
    }
  } catch (err) {
    console.error('데이터 조회 오류:', err.message);
  }
}

/**
 * 데이터 수정(업데이트) 함수
 */
async function updateData() {
  try {
    const range = '모임!A5'; // 수정할 셀 위치
    console.log(`\n✏️ '${range}' 셀에 데이터 업데이트 중...`);

    const values = [
      ['JavaScript에서 수정!'],
      // 여러 행을 한 번에 수정하려면 배열을 추가합니다.
      // ['두 번째 행'],
    ];

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED', // 입력된 값을 그대로 시트에 적용
      resource: { values },
    });

    console.log(`성공적으로 ${response.data.updatedCells}개 셀을 업데이트했습니다.`);

  } catch (err) {
    console.error('데이터 수정 오류:', err.message);
  }
}

/**
 * 데이터 추가(append) 함수
 */
async function appendData() {
  try {
    const range = '모임'; // 데이터를 추가할 시트 이름
    console.log(`\n➕ '${range}' 시트에 데이터 추가 중...`);

    const values = [
      [new Date().toLocaleString(), '자동 추가된 데이터', Math.floor(Math.random() * 1000)],
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log(`성공적으로 데이터를 추가했습니다. 추가된 위치: ${response.data.updates.updatedRange}`);

  } catch (err) {
    console.error('데이터 추가 오류:', err.message);
  }
}

async function 스냅샷히스토리시트업데이트(snapshot) {
  const range = '스냅샷히스토리'; // 데이터를 추가할 시트 이름
  console.log(`\n➕ '${range}' 시트에 데이터 추가 중...`);

  const values = [
    [new Date(), JSON.stringify(snapshot.사람들), JSON.stringify(snapshot.모임들), '0.0.1'],
  ];

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });

  console.log(`성공적으로 데이터를 추가했습니다. 추가된 위치: ${response.data.updates.updatedRange}`);
}

async function 구글시트에서사람목록가져오기() {
  const range = '사람'; // 데이터를 추가할 시트 이름

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
  });

  return response.data.values.slice(1).map((row) => {
    return {
      이름: row[0],
      식별자: row[1],
    }
  });
}

async function 구글시트에서사람목록에추가(사람들) {
  const range = '사람'; // 데이터를 추가할 시트 이름

  const values = 사람들.map((사람) => {
    return [사람.이름, 사람.식별자];
  });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });

  console.log(`성공적으로 데이터를 추가했습니다. 추가된 위치: ${response.data.updates.updatedRange}`);
}

async function 사람시트업데이트(snapshot) {

  const 사람들 = await 구글시트에서사람목록가져오기();

  // 이미 동일한 식별자가 존재하면 필터링, 식별자가 없으면 새로운 사람으로 추가
  const 새로운사람들 = snapshot.사람들.filter((스냅샷사람) => {
    return !사람들.some((구글시트사람) => 구글시트사람.식별자 === 스냅샷사람.식별자);
  });

  await 구글시트에서사람목록에추가(새로운사람들);

}

async function 모임시트에서모임목록가져오기() {
  const range = '모임'; // 데이터를 추가할 시트 이름

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
  });

  return response.data.values.slice(1).map((row) => {
    return {
      모임시각display함수: row[0],
      이름: row[1],
      식별자: row[2],
      참여자display함수: row[3],
      참여자식별자들: row[4]?.split(' ') ?? [],
      최대정원: row[5],
      참여자수: row[6],
      모임시각: row[7],
      모임장소: row[8],
      모임비용: row[9],
    }
  });
}

async function 모임목록덮어씌우기(모임들) {
  // 첫 행(헤더)은 덮어씌우면 안 되므로, 2번째 행부터 덮어씌운다.
  const range = '모임!A2'; // 2번째 행부터 시작

  const values = 모임들.map((모임, index) => {
    return [
      `=TEXT(VALUE(REGEXREPLACE(H${index + 2}, "[T|Z]", " ")), "yyyy년 m월 d일 am/pm h:mm")`,
      모임.이름,
      모임.식별자,
      모임.참여자식별자들.length > 0 ? `=TEXTJOIN(" ", TRUE, MAP(SPLIT(E${index + 2}, " "), LAMBDA(item, IFERROR(XLOOKUP(item, '사람'!B:B, '사람'!A:A), item))))` : '',
      모임.참여자식별자들.join(' '),
      모임.최대정원,
      모임.참여자수,
      모임.모임시각,
      모임.모임장소,
      모임.모임비용,
    ];
  });

  const response = await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: range,
    valueInputOption: 'USER_ENTERED',
    resource: { values },
  });

  console.log(`성공적으로 데이터를 추가했습니다. 추가된 위치: ${response.data.updatedRange}`);
}

async function 모임시트업데이트(snapshot) {
  // 모임시트 행은 다음과 같다:
  // 이름,	식별자,	미사용,	참여자식별자들,	최대정원,	참여자수,	모임시각,	모임장소,	모임비용

  // 모임시트 업데이트 규칙은 아래와 같다:
  // 식별자 찾기 -> 식별자가 없으면 새로운 모임으로 추가, 식별자가 있으면 덮어씌운다


  const 기존모임들 = await 모임시트에서모임목록가져오기();

  const 새로운모임들 = snapshot.모임들.filter((스냅샷모임) => {
    return !기존모임들.some((구글시트모임) => 구글시트모임.식별자 === 스냅샷모임.식별자);
  });

  const 기존모임들갱신 = 기존모임들.map((구글시트모임) => {
    const 스냅샷모임 = snapshot.모임들.find((스냅샷모임) => 스냅샷모임.식별자 === 구글시트모임.식별자);
    return {
      ...구글시트모임,
      ...스냅샷모임,
    };
  });

  const 모임들 = [...기존모임들갱신, ...새로운모임들];

  await 모임목록덮어씌우기(모임들);
}

const integrateSnapshotToGoogleSheet = async (snapshot) => {
  await 스냅샷히스토리시트업데이트(snapshot);
  await 사람시트업데이트(snapshot);
  await 모임시트업데이트(snapshot);
}

export default integrateSnapshotToGoogleSheet;