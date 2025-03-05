import { TodoRepository } from '../../usecases/repositories/TodoRepository.js';
import { Todo } from '../../entities/Todo.js';

/**
 * Dexie.js를 사용한 Todo 저장소 구현체
 * Clean Architecture의 인터페이스 어댑터 계층에 해당
 */
export class DexieTodoRepository extends TodoRepository {
  /**
   * DexieTodoRepository 생성자
   * @param {Dexie} database - Dexie.js 데이터베이스 인스턴스
   */
  constructor(database) {
    super();
    this.db = database;
  }

  /**
   * Todo 항목 저장 (생성 또는 업데이트)
   * @param {Todo} todo - 저장할 Todo 항목
   * @returns {Promise<Todo>} 저장된 Todo 항목
   */
  async save(todo) {
    await this.db.todos.put(todo.toJSON());
    return todo;
  }

  /**
   * Todo 항목 삭제
   * @param {string} id - 삭제할 Todo 항목의 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(id) {
    const count = await this.db.todos.delete(id);
    return count > 0;
  }

  /**
   * ID로 Todo 항목 조회
   * @param {string} id - 조회할 Todo 항목의 ID
   * @returns {Promise<Todo|null>} 조회된 Todo 항목 또는 null
   */
  async getById(id) {
    const todoData = await this.db.todos.get(id);
    return todoData ? new Todo(todoData) : null;
  }

  /**
   * 모든 Todo 항목 조회
   * @returns {Promise<Array<Todo>>} Todo 항목 배열
   */
  async getAll() {
    const todosData = await this.db.todos.toArray();
    return todosData.map(todoData => new Todo(todoData));
  }

  /**
   * 상태별 Todo 항목 조회
   * @param {string} status - 조회할 상태
   * @returns {Promise<Array<Todo>>} 해당 상태의 Todo 항목 배열
   */
  async getByStatus(status) {
    const todosData = await this.db.todos.where('status').equals(status).toArray();
    return todosData.map(todoData => new Todo(todoData));
  }

  /**
   * Todo 항목 검색
   * @param {string} query - 검색 쿼리
   * @returns {Promise<Array<Todo>>} 검색 결과 Todo 항목 배열
   */
  async search(query) {
    if (!query) return this.getAll();
    
    const normalizedQuery = query.toLowerCase().trim();
    
    // 제목과 설명에서 검색
    const todosData = await this.db.todos
      .filter(todoData => 
        (todoData.title && todoData.title.toLowerCase().includes(normalizedQuery)) ||
        (todoData.description && todoData.description.toLowerCase().includes(normalizedQuery))
      )
      .toArray();
    
    return todosData.map(todoData => new Todo(todoData));
  }
}
