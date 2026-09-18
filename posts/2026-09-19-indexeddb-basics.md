---
title: localStorage로는 부족할 때, IndexedDB 맛보기
date: 2026-09-19
tags: [브라우저, 저장소]
---

localStorage는 문자열만 저장할 수 있고 용량도 5MB 남짓이라, 오프라인에서 수천 개의 데이터를 다뤄야 하는 앱에는 부족하다는 걸 오늘 알게 됐다. 브라우저에는 이런 상황을 위한 IndexedDB라는 저장소가 따로 있었다.

## 키-값이 아니라 객체 저장소

IndexedDB는 문자열 대신 자바스크립트 객체를 그대로 저장하는 NoSQL 방식의 데이터베이스다. `objectStore`라는 테이블 같은 단위를 만들고, 그 안에 키를 기준으로 객체를 저장한다. 용량 제한도 localStorage보다 훨씬 넉넉해서 디스크 여유 공간에 따라 수백MB까지도 쓸 수 있다.

## 모든 작업은 비동기

localStorage의 `getItem`, `setItem`은 동기 방식이라 메인 스레드를 막지만, IndexedDB는 처음부터 비동기로 설계되어 있다. 요청을 보내고 `onsuccess`, `onerror` 이벤트로 결과를 받는 구조라 대량의 데이터를 다뤄도 화면이 멈추지 않는다.

```
const req = indexedDB.open('myDB', 1);
req.onupgradeneeded = (e) => {
  e.target.result.createObjectStore('notes', { keyPath: 'id' });
};
req.onsuccess = (e) => {
  const db = e.target.result;
  db.transaction('notes', 'readwrite')
    .objectStore('notes')
    .put({ id: 1, text: '오늘 배운 것' });
};
```

## 트랜잭션으로 묶인 작업

읽고 쓰는 모든 작업은 트랜잭션 안에서 일어난다. 트랜잭션은 특정 objectStore에 접근할 권한과 범위(`readonly` 또는 `readwrite`)를 지정하는 단위라서, 여러 작업을 하나의 트랜잭션으로 묶으면 중간에 실패했을 때 전체를 롤백할 수 있다.

정리하면, IndexedDB는 객체를 그대로 저장하고 모든 작업이 비동기로 처리되는 브라우저 내장 데이터베이스로, localStorage보다 다루기는 번거롭지만 대용량 오프라인 데이터를 다룰 때는 훨씬 적합한 선택지다.
