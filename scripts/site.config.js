// 사이트 한 곳 설정 — 정규 주소, 메타, 광고.
//
// 여기 있는 값이 canonical, Open Graph, JSON-LD, sitemap.xml, robots.txt,
// ads.txt에 모두 쓰인다. 주소를 바꿀 일이 생기면 이 파일만 고치면 된다.

export const site = {
  // 끝의 슬래시를 포함한다. 커스텀 도메인을 연결하면 이 값만 바꾼다.
  url: 'https://jcy0908.github.io/my-blog/',
  title: '감도 感度',
  tagline: '감각의 해상도를 높이는 연습',
  description:
    '좋았던 것들이 왜 좋았는지, 감각과 구조를 언어로 기록하는 감도 感度입니다.',
  locale: 'ko_KR',
  lang: 'ko',
  author: '정찬용',
};

// Google AdSense.
//
// publisherId가 비어 있으면 광고 스크립트도, ads.txt도 만들지 않는다.
// 승인 전에 코드만 먼저 넣어 둘 이유가 없고, 빈 ads.txt는 오히려
// 소유권 확인을 방해한다.
//
// 준비가 되면 'pub-' 뒤 16자리를 포함한 전체 값을 넣는다.
//   예: 'ca-pub-0000000000000000'
//
// AdSense 승인은 코드가 아니라 사이트 상태를 본다. Google은 소유권과
// 정책 준수, 실제 콘텐츠 품질을 검토하며 '글 몇 개'로 보장되지 않는다.
// 그래서 이 저장소는 소개·연락처·개인정보 처리방침 페이지를 함께 만든다.
export const adsense = {
  publisherId: '',
  // 자동 광고. Google이 위치를 정한다.
  autoAds: true,
};

/** 사이트 루트 기준 경로를 절대 URL로. */
export function absoluteUrl(pathname = '') {
  return new URL(String(pathname).replace(/^\//, ''), site.url).href;
}
