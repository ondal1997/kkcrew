import somoimCredentials from "./somoim.credentials.json";

// POST 요청을 보낼 비동기 함수
async function postGroupInfo() {
    // 1. 서버로 전송할 데이터를 객체 형태로 준비합니다.
    // TODO: 여기에 전송할 실제 데이터를 채워주세요.
    const dataToSend = somoimCredentials;
  
    // 2. 요청을 보낼 URL
    const url = 'https://sm-members.fcfc-1.com/group_infos/sync_gi/b16c59c2-e099-11ef-94e6-0a81256f700d1.json';
  
    try {
      // 3. fetch 함수를 사용해 POST 요청을 보냅니다.
      const response = await fetch(url, {
        method: 'POST', // 요청 메소드
        headers: {
          'Content-Type': 'application/json', // 보내는 데이터의 타입
          'Accept': 'application/json' // 받고자 하는 데이터의 타입
        },
        body: JSON.stringify(dataToSend) // JavaScript 객체를 JSON 문자열로 변환
      });
  
      // 4. 서버의 응답 상태를 확인합니다.
      if (!response.ok) {
        // 응답 상태가 정상이 아닐 경우 (예: 404, 500 에러)
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // 5. 응답 데이터를 JSON 형태로 파싱합니다.
      const responseData = await response.json();
  
      // 6. 성공 결과 및 받은 데이터를 콘솔에 출력합니다.
      console.log('요청 성공:', responseData);
      
      return responseData; // 성공한 데이터를 반환
  
    } catch (error) {
      // 7. 요청 중 발생한 에러를 콘솔에 출력합니다.
      console.error('요청 실패:', error);
    }
  }
  
  // 위에서 작성한 함수를 실행합니다.
  postGroupInfo();