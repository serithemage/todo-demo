import Dexie from 'https://unpkg.com/dexie@3.2.2/dist/dexie.esm.js';

/**
 * Todo 앱 데이터베이스 클래스
 * Dexie.js를 사용한 IndexedDB 래퍼
 */
export class TodoDatabase extends Dexie {
  /**
   * TodoDatabase 생성자
   */
  constructor() {
    super('TodoApp');
    
    // 데이터베이스 스키마 정의
    this.version(1).stores({
      todos: '++id, title, description, dueDate, status, createdAt, updatedAt'
    });
    
    // 컬렉션 정의
    this.todos = this.table('todos');
  }

  /**
   * 데이터베이스 초기화 및 샘플 데이터 추가 (필요한 경우)
   * @returns {Promise<void>}
   */
  async initialize() {
    const count = await this.todos.count();
    
    // 데이터가 없는 경우 샘플 데이터 추가
    if (count === 0) {
      console.log('샘플 Todo 데이터를 추가합니다.');
      
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      await this.todos.bulkAdd([
        {
          title: '샘플 할 일 1',
          description: '이것은 샘플 할 일입니다.',
          dueDate: tomorrow,
          status: '미완료',
          createdAt: today,
          updatedAt: today
        },
        {
          title: '샘플 할 일 2',
          description: '이것은 진행 중인 샘플 할 일입니다.',
          dueDate: nextWeek,
          status: '진행 중',
          createdAt: today,
          updatedAt: today
        },
        {
          title: '샘플 할 일 3',
          description: '이것은 완료된 샘플 할 일입니다.',
          dueDate: today,
          status: '완료',
          createdAt: today,
          updatedAt: today
        }
      ]);
    }
  }
}
