import { getPaginationItems } from './getPaginationItems';

describe('getPaginationItems', () => {
  it('전체 페이지가 7개 이하이면 모든 페이지를 반환한다', () => {
    expect(getPaginationItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('전체 페이지가 7개이면 말줄임표 없이 모든 페이지를 반환한다', () => {
    expect(getPaginationItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('전체 페이지가 8개이면 말줄임표를 사용한다', () => {
    expect(getPaginationItems(4, 8)).toEqual([1, 'start-ellipsis', 3, 4, 5, 'end-ellipsis', 8]);
  });

  it('현재 페이지가 앞쪽이면 뒤쪽 말줄임표를 반환한다', () => {
    expect(getPaginationItems(2, 10)).toEqual([1, 2, 3, 4, 'end-ellipsis', 10]);
  });

  it('현재 페이지가 가운데면 양쪽 말줄임표를 반환한다', () => {
    expect(getPaginationItems(5, 10)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10]);
  });

  it('네 번째 페이지부터 양쪽 말줄임표를 반환한다', () => {
    expect(getPaginationItems(4, 10)).toEqual([1, 'start-ellipsis', 3, 4, 5, 'end-ellipsis', 10]);
  });

  it('현재 페이지가 뒤쪽이면 앞쪽 말줄임표를 반환한다', () => {
    expect(getPaginationItems(9, 10)).toEqual([1, 'start-ellipsis', 7, 8, 9, 10]);
  });

  it('마지막 세 페이지 영역부터 앞쪽 말줄임표만 반환한다', () => {
    expect(getPaginationItems(8, 10)).toEqual([1, 'start-ellipsis', 7, 8, 9, 10]);
  });
});
