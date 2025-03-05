/**
 * DexieTodoRepository 테스트
 */
import Dexie from 'dexie';
import { DexieTodoRepository } from '../../src/adapters/repositories/DexieTodoRepository.js';
import { Todo, TodoStatus } from '../../src/entities/Todo.js';

// 테스트용 인메모리 Dexie 데이터베이스 설정
class TestTodoDatabase extends Dexie {
  constructor() {
    super('TestTodoDatabase');
    this.version(1).stores({
      todos: 'id, title, description, dueDate, status, createdAt, updatedAt'
    });
  }
}

describe('DexieTodoRepository', () => {
  let repository;
  let db;
  
  beforeEach(async () => {
    // 각 테스트 전에 새로운 인메모리 데이터베이스 생성
    db = new TestTodoDatabase();
    repository = new DexieTodoRepository(db);
    
    // 기존 데이터 정리
    await db.todos.clear();
  });
  
  afterEach(async () => {
    // 각 테스트 후 데이터베이스 연결 종료
    await db.close();
  });
  
  describe('save', () => {
    test('새로운 Todo를 저장할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '테스트 할 일',
        description: '테스트 설명',
        dueDate: new Date('2025-12-31')
      });
      
      // When
      const savedTodo = await repository.save(todo);
      
      // Then
      expect(savedTodo).toEqual(todo);
      
      // 데이터베이스에 저장되었는지 확인
      const storedTodo = await db.todos.get(todo.id);
      expect(storedTodo).toBeDefined();
      expect(storedTodo.id).toBe(todo.id);
      expect(storedTodo.title).toBe(todo.title);
      expect(storedTodo.description).toBe(todo.description);
      expect(new Date(storedTodo.dueDate)).toEqual(todo.dueDate);
      expect(storedTodo.status).toBe(todo.status);
    });
    
    test('기존 Todo를 업데이트할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '원래 제목',
        description: '원래 설명',
        dueDate: new Date('2025-12-31')
      });
      
      // 먼저 저장
      await repository.save(todo);
      
      // 업데이트 데이터
      todo.title = '수정된 제목';
      todo.description = '수정된 설명';
      todo.status = TodoStatus.IN_PROGRESS;
      
      // When
      const updatedTodo = await repository.save(todo);
      
      // Then
      expect(updatedTodo).toEqual(todo);
      
      // 데이터베이스에 업데이트되었는지 확인
      const storedTodo = await db.todos.get(todo.id);
      expect(storedTodo).toBeDefined();
      expect(storedTodo.title).toBe('수정된 제목');
      expect(storedTodo.description).toBe('수정된 설명');
      expect(storedTodo.status).toBe(TodoStatus.IN_PROGRESS);
    });
  });
  
  describe('getById', () => {
    test('ID로 Todo를 조회할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '테스트 할 일',
        description: '테스트 설명',
        dueDate: new Date('2025-12-31')
      });
      
      // 먼저 저장
      await repository.save(todo);
      
      // When
      const retrievedTodo = await repository.getById(todo.id);
      
      // Then
      expect(retrievedTodo).toBeDefined();
      expect(retrievedTodo.id).toBe(todo.id);
      expect(retrievedTodo.title).toBe(todo.title);
      expect(retrievedTodo.description).toBe(todo.description);
      expect(retrievedTodo.dueDate).toEqual(todo.dueDate);
      expect(retrievedTodo.status).toBe(todo.status);
    });
    
    test('존재하지 않는 ID로 조회하면 null을 반환해야 한다', async () => {
      // When
      const retrievedTodo = await repository.getById('non-existent-id');
      
      // Then
      expect(retrievedTodo).toBeNull();
    });
  });
  
  describe('getAll', () => {
    test('모든 Todo를 조회할 수 있어야 한다', async () => {
      // Given
      const todo1 = new Todo({
        title: '할 일 1',
        description: '설명 1',
        dueDate: new Date('2025-12-31')
      });
      
      const todo2 = new Todo({
        title: '할 일 2',
        description: '설명 2',
        dueDate: new Date('2025-11-30')
      });
      
      // 저장
      await repository.save(todo1);
      await repository.save(todo2);
      
      // When
      const todos = await repository.getAll();
      
      // Then
      expect(todos).toHaveLength(2);
      expect(todos.some(todo => todo.id === todo1.id)).toBe(true);
      expect(todos.some(todo => todo.id === todo2.id)).toBe(true);
    });
    
    test('Todo가 없으면 빈 배열을 반환해야 한다', async () => {
      // When
      const todos = await repository.getAll();
      
      // Then
      expect(todos).toHaveLength(0);
    });
  });
  
  describe('getByStatus', () => {
    test('상태별로 Todo를 필터링할 수 있어야 한다', async () => {
      // Given
      const todo1 = new Todo({
        title: '할 일 1',
        description: '설명 1',
        dueDate: new Date('2025-12-31')
      });
      
      const todo2 = new Todo({
        title: '할 일 2',
        description: '설명 2',
        dueDate: new Date('2025-11-30')
      });
      todo2.status = TodoStatus.IN_PROGRESS;
      
      const todo3 = new Todo({
        title: '할 일 3',
        description: '설명 3',
        dueDate: new Date('2025-10-31')
      });
      todo3.status = TodoStatus.DONE;
      
      // 저장
      await repository.save(todo1);
      await repository.save(todo2);
      await repository.save(todo3);
      
      // When
      const todoItems = await repository.getByStatus(TodoStatus.TODO);
      const inProgressItems = await repository.getByStatus(TodoStatus.IN_PROGRESS);
      const doneItems = await repository.getByStatus(TodoStatus.DONE);
      
      // Then
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0].id).toBe(todo1.id);
      
      expect(inProgressItems).toHaveLength(1);
      expect(inProgressItems[0].id).toBe(todo2.id);
      
      expect(doneItems).toHaveLength(1);
      expect(doneItems[0].id).toBe(todo3.id);
    });
  });
  
  describe('delete', () => {
    test('Todo를 삭제할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '테스트 할 일',
        description: '테스트 설명',
        dueDate: new Date('2025-12-31')
      });
      
      // 먼저 저장
      await repository.save(todo);
      
      // When
      const result = await repository.delete(todo.id);
      
      // Then
      expect(result).toBe(true);
      
      // 데이터베이스에서 삭제되었는지 확인
      const storedTodo = await db.todos.get(todo.id);
      expect(storedTodo).toBeUndefined();
    });
    
    test('존재하지 않는 ID로 삭제하면 false를 반환해야 한다', async () => {
      // When
      const result = await repository.delete('non-existent-id');
      
      // Then
      expect(result).toBe(false);
    });
  });
  
  describe('search', () => {
    test('제목과 설명으로 Todo를 검색할 수 있어야 한다', async () => {
      // Given
      const todo1 = new Todo({
        title: '프로젝트 계획 작성',
        description: '팀 회의 준비',
        dueDate: new Date('2025-12-31')
      });
      
      const todo2 = new Todo({
        title: '이메일 확인',
        description: '프로젝트 관련 이메일 확인',
        dueDate: new Date('2025-11-30')
      });
      
      const todo3 = new Todo({
        title: '보고서 작성',
        description: '월간 보고서 작성',
        dueDate: new Date('2025-10-31')
      });
      
      // 저장
      await repository.save(todo1);
      await repository.save(todo2);
      await repository.save(todo3);
      
      // When
      const searchResults1 = await repository.search('프로젝트');
      const searchResults2 = await repository.search('보고서');
      const searchResults3 = await repository.search('없는 키워드');
      
      // Then
      expect(searchResults1).toHaveLength(2);
      expect(searchResults1.some(todo => todo.id === todo1.id)).toBe(true);
      expect(searchResults1.some(todo => todo.id === todo2.id)).toBe(true);
      
      expect(searchResults2).toHaveLength(1);
      expect(searchResults2[0].id).toBe(todo3.id);
      
      expect(searchResults3).toHaveLength(0);
    });
  });
});
