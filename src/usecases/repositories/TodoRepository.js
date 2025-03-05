/**
 * Todo 저장소 인터페이스
 * Clean Architecture의 유스케이스 계층에서 정의된 인터페이스
 * 의존성 역전 원칙(DIP)을 적용하여 구체적인 구현체에 의존하지 않음
 */
export class TodoRepository {
  /**
   * Todo 항목 저장 (생성 또는 업데이트)
   * @param {Todo} todo - 저장할 Todo 항목
   * @returns {Promise<Todo>} 저장된 Todo 항목
   */
  async save(todo) {
    throw new Error('TodoRepository.save()는 구현체에서 구현해야 합니다.');
  }

  /**
   * Todo 항목 삭제
   * @param {string} id - 삭제할 Todo 항목의 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(id) {
    throw new Error('TodoRepository.delete()는 구현체에서 구현해야 합니다.');
  }

  /**
   * ID로 Todo 항목 조회
   * @param {string} id - 조회할 Todo 항목의 ID
   * @returns {Promise<Todo|null>} 조회된 Todo 항목 또는 null
   */
  async getById(id) {
    throw new Error('TodoRepository.getById()는 구현체에서 구현해야 합니다.');
  }

  /**
   * 모든 Todo 항목 조회
   * @returns {Promise<Array<Todo>>} Todo 항목 배열
   */
  async getAll() {
    throw new Error('TodoRepository.getAll()는 구현체에서 구현해야 합니다.');
  }

  /**
   * 상태별 Todo 항목 조회
   * @param {string} status - 조회할 상태
   * @returns {Promise<Array<Todo>>} 해당 상태의 Todo 항목 배열
   */
  async getByStatus(status) {
    throw new Error('TodoRepository.getByStatus()는 구현체에서 구현해야 합니다.');
  }

  /**
   * Todo 항목 검색
   * @param {string} query - 검색 쿼리
   * @returns {Promise<Array<Todo>>} 검색 결과 Todo 항목 배열
   */
  async search(query) {
    throw new Error('TodoRepository.search()는 구현체에서 구현해야 합니다.');
  }
}
