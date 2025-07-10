import integrateSnapshotToGoogleSheet from "./google.js";
import getSomoimSnapshot from "./somoim.js";
import { gid } from "./somoim.credentials.json";

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


const snapshot = await getSomoimSnapshot(gid);
await integrateSnapshotToGoogleSheet(snapshot);