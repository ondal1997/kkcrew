import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

const now = new Date();

function transformTime(somoimTime) {
    const getDate = (dateString) => {
        if (dateString === '내일') {
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0);
        };
        if (dateString === '모레') {
            return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0);
        };
        if (dateString === '오늘') {
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
        };

        // 7/13(일)
        const [month, dayWithWeek] = dateString.split('/');
        const [day] = dayWithWeek.split('(');
        return new Date(now.getFullYear(), month - 1, day, 0, 0);
    }

    try {
        // 들어올수있는값은 아래와 같은 형식이다. (전부 코리안시간대다.)
        // 이값들을 적절히 date로 변환하고 싶다.

        // 내일 오후 7:00
        // 모레 오후 7:00
        // 오늘 오후 7:00
        // 오늘 오전 7:00
        // 오늘 오전 7:00
        // 7/13(일) 오후 1:00

        const [date, ampm, time] = somoimTime.split(' ');
        const [hour, minute] = time.split(':');
        const hourWithAmpm = ampm === '오후' ? parseInt(hour, 10) + 12 : parseInt(hour, 10);

        const dateObj = getDate(date);

        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hourWithAmpm, minute);
    } catch (e) {
        // 해가 바뀌는 케이스는 잘 모르겠따. ㅎㅎ;
        console.error("Error transforming time:", e);
        return `${now} 기준 ${somoimTime}`
    }
}

function extractMeetingMembers(htmlString) {
    const members = [];
    const regex = /\\"members\\":\[(.*?)\]/s;
    const match = htmlString.match(regex);

    if (match && match[1]) {
        // 1. 백슬래시(\)로 이스케이프된 큰따옴표(\")를 일반 큰따옴표(")로 변경합니다.
        let membersString = match[1].replace(/\\"/g, '"');

        // 아래 로직은 이미 키가 큰따옴표로 감싸져 있으므로 현재 입력값에는 큰 영향을 주지 않습니다.
        membersString = membersString.replace(/(\w+):/g, '"$1":').replace(/,(\s*[\}\]])/g, '$1');

        try {
            // 2. 문자열을 대괄호(`[]`)로 감싸 유효한 JSON 배열 형식으로 만듭니다.
            const parsedMembers = JSON.parse(`[${membersString}]`);
            parsedMembers.forEach(member => {
                if (member.mn && member.mid && member.ban !== 'Y') {
                    members.push({
                        이름: member.mn,
                        mid: member.mid,
                        ban: member.ban,
                        식별자: `https://d228e474i2d5yf.cloudfront.net/${member.mid}t.png`
                    });
                }
            });
        } catch (e) {
            console.error("Error parsing members JSON:", e);
        }
    }
    return members;
}

function extractMeetingInfo(htmlString) {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;

    // 1. <script> 태그에서 이벤트 메타데이터 추출 및 eid 맵 생성
    const eidMap = new Map();
    const scripts = doc.querySelectorAll('script');
    let eventsData = [];

    // 모든 스크립트 태그를 순회하며 'events' 데이터가 포함된 부분을 찾습니다.
    scripts.forEach(script => {
        // 정규식을 사용하여 "events":[...] 형식의 데이터를 찾습니다.
        const match = script.textContent.match(/"events":(\[.*?\])/);
        if (match && match[1]) {
            try {
                const events = JSON.parse(match[1]);
                events.forEach(event => {
                    // 모임 이미지 URL을 키로, 모임 식별자(eid)를 값으로 하는 맵을 만듭니다.
                    if (event.imgUrl && event.eid) {
                        eidMap.set(event.imgUrl, event.eid);
                    }
                });
            } catch (e) {
            }
        }
    });


    // 2. '정모 일정' 섹션의 모든 모임 요소를 선택합니다.
    const meetingSectionsContainer = Array.from(doc.querySelectorAll('h2')).find(h2 => h2.textContent.includes('정모 일정'));
    if (!meetingSectionsContainer) {
        return []; // '정모 일정' 섹션이 없으면 빈 배열을 반환합니다.
    }

    const meetingListContainer = meetingSectionsContainer.nextElementSibling;
    const meetingElements = meetingListContainer.querySelectorAll('.flex.space-x-3');

    const results = [];

    // 3. 각 모임 요소를 순회하며 정보 추출
    meetingElements.forEach(meetingEl => {
        // 4. 세부 정보 추출
        const name = meetingEl.querySelector('h3')?.textContent.trim() || '';
        const detailsElements = meetingEl.querySelectorAll('p.text-\\[\\#404040\\]');
        const time = detailsElements[0]?.textContent.trim() || '';
        const location = detailsElements[1]?.textContent.trim() || '';
        const cost = detailsElements[2]?.textContent.trim() || '';
        const meetingImage = meetingEl.querySelector('div[draggable="false"] img')?.src || '';

        const participantImages = Array.from(meetingEl.querySelectorAll('img[alt="member face"]')).map(img => img.src);

        const countSpan = meetingEl.querySelector('span.text-base.font-sf-pro');
        const currentParticipantsText = countSpan?.querySelector('span.font-bold')?.textContent.trim() || '0';
        const totalCapacityText = countSpan?.querySelector('span.text-\\[\\#A0A0A0\\]')?.textContent.trim() || '0';

        const currentParticipants = parseInt(currentParticipantsText, 10);
        const totalCapacity = parseInt(totalCapacityText, 10);

        // 5. 추출한 정보를 JSON 객체로 조합
        results.push({
            "이름": name,
            "모임시각": transformTime(time),
            "모임장소": location,
            "최대정원": totalCapacity,
            "참여자수": currentParticipants,
            "참여자식별자들": participantImages,
            "식별자": meetingImage,
            "모임비용": cost
        });
    });

    return results;
}

const getSomoimSnapshot = async (somoimId) => {
    const html = await fetch(`https://www.somoim.co.kr/${somoimId}`).then((res) => res.text());
    return {
        사람들: extractMeetingMembers(html),
        모임들: extractMeetingInfo(html),
    }
}

export default getSomoimSnapshot;
