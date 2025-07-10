import fetch from 'node-fetch';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// JSON 파일을 동기적으로 읽어옵니다
const somoimCredentials = JSON.parse(
    readFileSync(join(__dirname, './somoim.credentials.json'), 'utf8')
);

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

        return responseData; // 성공한 데이터를 반환

    } catch (error) {
        // 7. 요청 중 발생한 에러를 콘솔에 출력합니다.
        console.error('요청 실패:', error);
        throw error;
    }
}


const getSomoimSnapshot = async () => {
    const responseData = await postGroupInfo();

    const members = [...responseData.m, responseData.me].filter((member) => member.ban !== 'Y').map((member) => {
        return {
            식별자: `https://d228e474i2d5yf.cloudfront.net/${member.mid}t.png`,
            이름: member.mn,
            모임참여여부: [member.ijo, member.ijo2, member.ijo3, member.ijo4].map((ijo, index) => ijo === 'Y'),
        }
    });

    const {
        en,
        e_d,
        e_t,
        el,
        ee,
        emm,
        emap,

        en2,
        e_d2,
        e_t2,
        el2,
        ee2,
        emm2,
        emap2,

        en3,
        e_d3,
        e_t3,
        el3,
        ee3,
        emm3,
        emap3,

        en4,
        e_d4,
        e_t4,
        el4,
        ee4,
        emm4,
        emap4,
    } = responseData.g;

    const getDate = (date, time) => {
        // date: 20250711 time: 1400 -> 2025-07-11T14:00+09:00 as string
        const dateString = `${date.toString().slice(0, 4)}-${date.toString().slice(4, 6)}-${date.toString().slice(6, 8)}T${time.toString().slice(0, 2)}:${time.toString().slice(2, 4)}+09:00`;
        return new Date(dateString);
    }

    const getId = (date, time) => {
        return `https://d228e474i2d5yf.cloudfront.net/1c5aaf1a-cf59-11ef-a7f7-0a11cf6b2d491${date}${time}s1.png`;
    }

    const meetings = [
        {
            식별자: getId(e_d, e_t),
            이름: en,
            참여자식별자들: [],
            최대정원: emm,
            참여자수: 0,
            모임시각: getDate(e_d, e_t),
            모임장소: el,
            모임비용: ee,
        },
        {
            식별자: getId(e_d2, e_t2),
            이름: en2,
            참여자식별자들: [],
            최대정원: emm2,
            참여자수: 0,
            모임시각: getDate(e_d2, e_t2),
            모임장소: el2,
            모임비용: ee2,
        },
        {
            식별자: getId(e_d3, e_t3),
            이름: en3,
            참여자식별자들: [],
            최대정원: emm3,
            참여자수: 0,
            모임시각: getDate(e_d3, e_t3),
            모임장소: el3,
            모임비용: ee3,
        },
        {
            식별자: getId(e_d4, e_t4),
            이름: en4,
            참여자식별자들: [],
            최대정원: emm4,
            참여자수: 0,
            모임시각: getDate(e_d4, e_t4),
            모임장소: el4,
            모임비용: ee4,
        },
    ];

    meetings.forEach((meeting, index) => {
        meeting.참여자식별자들 = members.filter(member => member.모임참여여부[index]).map(member => member.식별자);
        meeting.참여자수 = meeting.참여자식별자들.length;
    });

    return {
        사람들: members,
        모임들: meetings,
    };
}

export default getSomoimSnapshot;
