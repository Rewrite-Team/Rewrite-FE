import { getMockCoverLetterListResponse } from './coverLetterList';

describe('getMockCoverLetterListResponse', () => {
  it('백엔드와 동일한 페이지 메타데이터와 첫 페이지 항목을 반환한다', () => {
    const response = getMockCoverLetterListResponse(1);

    expect(response).toMatchObject({
      page: 1,
      size: 9,
      totalItems: 21,
      totalPages: 3,
    });
    expect(response.items).toHaveLength(9);
  });

  it('마지막 페이지에는 남은 항목만 반환한다', () => {
    expect(getMockCoverLetterListResponse(3).items).toHaveLength(3);
  });

  it('전체 페이지를 초과한 요청은 마지막 페이지로 정규화한다', () => {
    expect(getMockCoverLetterListResponse(10).page).toBe(3);
  });
});
