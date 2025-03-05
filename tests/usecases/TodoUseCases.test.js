/**
 * TodoUseCases 테스트
 */
import { TodoUseCases } from '../../src/usecases/TodoUseCases.js';
import { MockTodoRepository } from '../mocks/MockTodoRepository.js';
import { Todo, TodoStatus } from '../../src/entities/Todo.js';

describe('TodoUseCases', () => {
  let todoUseCases;
  let mockRepository;
  
  beforeEach(() => {
    mockRepository = new MockTodoRepository();
    todoUseCases = new TodoUseCases(mockRepository);
  });
  
  describe('createTodo', () => {
    test('새로운 Todo를 생성하고 저장해야 한다', async () => {
      // Given
      const todoData = {
        title: '테스트 할 일',
        description: '테스트 설명',
        dueDate: new Date('2025-12-31')
      };
      
      // When
      const createdTodo = await todoUseCases.createTodo(todoData);
      
      // Then
      expect(createdTodo).toBeDefined();
      expect(createdTodo.id).toBeDefined();
      expect(createdTodo.title).toBe(todoData.title);
      expect(createdTodo.description).toBe(todoData.description);
      expect(createdTodo.dueDate).toEqual(todoData.dueDate);
      expect(createdTodo.status).toBe(TodoStatus.TODO);
      
      // 저장소에 저장되었는지 확인
      const savedTodo = await mockRepository.getById(createdTodo.id);
      expect(savedTodo).toEqual(createdTodo);
    });
  });
  
  describe('getTodoById', () => {
    test('ID로 Todo를 조회할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '테스트 할 일',
        description: '테스트 설명',
        dueDate: new Date('2025-12-31')
      });
      await mockRepository.save(todo);
      
      // When
      const retrievedTodo = await todoUseCases.getTodoById(todo.id);
      
      // Then
      expect(retrievedTodo).toEqual(todo);
    });
    
    test('존재하지 않는 ID로 조회하면 null을 반환해야 한다', async () => {
      // When
      const retrievedTodo = await todoUseCases.getTodoById('non-existent-id');
      
      // Then
      expect(retrievedTodo).toBeNull();
    });
  });
  
  describe('updateTodo', () => {
    test('Todo를 업데이트할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '원래 제목',
        description: '원래 설명',
        dueDate: new Date('2025-12-31')
      });
      await mockRepository.save(todo);
      
      const updateData = {
        title: '수정된 제목',
        description: '수정된 설명',
        dueDate: new Date('2026-01-15'),
        status: TodoStatus.IN_PROGRESS
      };
      
      // When
      const updatedTodo = await todoUseCases.updateTodo(todo.id, updateData);
      
      // Then
      expect(updatedTodo).toBeDefined();
      expect(updatedTodo.id).toBe(todo.id);
      expect(updatedTodo.title).toBe(updateData.title);
      expect(updatedTodo.description).toBe(updateData.description);
      expect(updatedTodo.dueDate).toEqual(updateData.dueDate);
      expect(updatedTodo.status).toBe(updateData.status);
      
      // 저장소에 업데이트되었는지 확인
      const savedTodo = await mockRepository.getById(todo.id);
      expect(savedTodo).toEqual(updatedTodo);
    });
    
    test('존재하지 않는 ID로 업데이트하면 null을 반환해야 한다', async () => {
      // When
      const updatedTodo = await todoUseCases.updateTodo('non-existent-id', {
        title: '수정된 제목'
      });
      
      // Then
      expect(updatedTodo).toBeNull();
    });
  });
  
  describe('deleteTodo', () => {
    test('Todo를 삭제할 수 있어야 한다', async () => {
      // Given
      const todo = new Todo({
        title: '테스트 할 일',
        description: '테스트 설명',
        dueDate: new Date('2025-12-31')
      });
      await mockRepository.save(todo);
      
      // When
      const result = await todoUseCases.deleteTodo(todo.id);
      
      // Then
      expect(result).toBe(true);
      
      // 저장소에서 삭제되었는지 확인
      const deletedTodo = await mockRepository.getById(todo.id);
      expect(deletedTodo).toBeNull();
    });
    
    test('존재하지 않는 ID로 삭제하면 false를 반환해야 한다', async () => {
      // When
      const result = await todoUseCases.deleteTodo('non-existent-id');
      
      // Then
      expect(result).toBe(false);
    });
  });
  
  describe('getAllTodos', () => {
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
      
      await mockRepository.save(todo1);
      await mockRepository.save(todo2);
      
      // When
      const todos = await todoUseCases.getAllTodos();
      
      // Then
      expect(todos).toHaveLength(2);
      expect(todos).toEqual(expect.arrayContaining([todo1, todo2]));
    });
  });
  
  describe('getTodosByStatus', () => {
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
        dueDate: new Date('2025-11-30'),
        status: TodoStatus.IN_PROGRESS
      });
      todo2.status = TodoStatus.IN_PROGRESS;
      
      const todo3 = new Todo({
        title: '할 일 3',
        description: '설명 3',
        dueDate: new Date('2025-10-31'),
        status: TodoStatus.DONE
      });
      todo3.status = TodoStatus.DONE;
      
      await mockRepository.save(todo1);
      await mockRepository.save(todo2);
      await mockRepository.save(todo3);
      
      // When
      const todoItems = await todoUseCases.getTodosByStatus(TodoStatus.TODO);
      const inProgressItems = await todoUseCases.getTodosByStatus(TodoStatus.IN_PROGRESS);
      const doneItems = await todoUseCases.getTodosByStatus(TodoStatus.DONE);
      
      // Then
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0]).toEqual(todo1);
      
      expect(inProgressItems).toHaveLength(1);
      expect(inProgressItems[0]).toEqual(todo2);
      
      expect(doneItems).toHaveLength(1);
      expect(doneItems[0]).toEqual(todo3);
    });
  });
  
  describe('searchTodos', () => {
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
      
      await mockRepository.save(todo1);
      await mockRepository.save(todo2);
      await mockRepository.save(todo3);
      
      // When
      const searchResults1 = await todoUseCases.searchTodos('프로젝트');
      const searchResults2 = await todoUseCases.searchTodos('보고서');
      const searchResults3 = await todoUseCases.searchTodos('없는 키워드');
      
      // Then
      expect(searchResults1).toHaveLength(2);
      expect(searchResults1).toEqual(expect.arrayContaining([todo1, todo2]));
      
      expect(searchResults2).toHaveLength(1);
      expect(searchResults2[0]).toEqual(todo3);
      
      expect(searchResults3).toHaveLength(0);
    });
  });
  
  describe('sortTodosByDueDate', () => {
    test('마감일 기준으로 Todo를 정렬할 수 있어야 한다', async () => {
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
      
      const todo3 = new Todo({
        title: '할 일 3',
        description: '설명 3',
        dueDate: new Date('2025-10-31')
      });
      
      await mockRepository.save(todo1);
      await mockRepository.save(todo2);
      await mockRepository.save(todo3);
      
      // When
      const sortedAsc = await todoUseCases.sortTodosByDueDate('asc');
      const sortedDesc = await todoUseCases.sortTodosByDueDate('desc');
      
      // Then
      expect(sortedAsc).toHaveLength(3);
      expect(sortedAsc[0]).toEqual(todo3); // 가장 빠른 마감일
      expect(sortedAsc[1]).toEqual(todo2);
      expect(sortedAsc[2]).toEqual(todo1);
      
      expect(sortedDesc).toHaveLength(3);
      expect(sortedDesc[0]).toEqual(todo1); // 가장 늦은 마감일
      expect(sortedDesc[1]).toEqual(todo2);
      expect(sortedDesc[2]).toEqual(todo3);
    });
  });
});
