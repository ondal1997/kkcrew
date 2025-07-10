import integrateSnapshotToGoogleSheet from "./google.js";
import getSomoimSnapshot from "./somoim.js";
import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// JSON 파일을 동기적으로 읽어옵니다
const kakaoCredentials = JSON.parse(
    readFileSync(join(__dirname, './kakao.credentials.json'), 'utf8')
);

// const snapshot = {
//     모임들: [],
//     사람들: [],
// }

const 모임 = {
    식별자: '',
    이름: '',
    참여자식별자들: [],
    최대정원: 0,
    참여자수: 0,
    모임시각: '',
    모임장소: '',
    모임비용: '',
}

const 사람 = {
    식별자: '',
    이름: '',
}


try {
    const snapshot = await getSomoimSnapshot();
    await integrateSnapshotToGoogleSheet(snapshot);
} catch (e) {
    console.error(e);
    await sendEmail();
}


async function sendEmail() {
    // 1. Transporter 생성 (SMTP 서버 설정)
    // 여기서는 Gmail SMTP 서버를 예시로 들었어요.
    // 실제 사용 시에는 여러분의 이메일 서비스 제공업체 정보를 입력해야 합니다.
    // 주의: Gmail은 '앱 비밀번호'를 사용해야 할 수 있습니다.
    // 네이버/다음도 SMTP 설정을 확인해야 합니다.
    let transporter = nodemailer.createTransport({
      service: 'kakao', // 또는 'Naver', 'Daum' 등
      host: 'smtp.kakao.com',
      port: 465, // 일반적인 SMTP 포트 (TLS)
      secure: true, // TLS 사용 (true면 465 포트, SSL)
      auth: {
        user: kakaoCredentials.user, // 발신자 이메일 주소
        pass: kakaoCredentials.pass // 이메일 비밀번호 또는 앱 비밀번호
      },
      tls: {
          // 일부 환경에서 필요한 설정 (인증서 오류 방지)
          rejectUnauthorized: false
      }
    });
  
    // 2. 이메일 옵션 설정
    let mailOptions = {
      from: '"소모임 벙 히스토리 자동화도구" <' + kakaoCredentials.user + '>', // 발신자 표시 이름과 이메일 주소
      to: kakaoCredentials.user, // 수신자 이메일 주소 (쉼표로 여러 명 가능)
      subject: '🚨 소모임 벙 히스토리 자동화도구에 문제가 발생했어요', // 이메일 제목
      html: `https://github.com/ondal1997/kkcrew/actions`, // HTML 형식의 본문
    };
  
    // 3. 이메일 전송
    try {
      let info = await transporter.sendMail(mailOptions);
      console.log('이메일 전송 성공:', info.messageId);
      console.log('메시지 URL:', nodemailer.getTestMessageUrl(info)); // 테스트 계정 사용 시 유용
    } catch (error) {
      console.error('이메일 전송 실패:', error);
    }
  }
  