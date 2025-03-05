import { Todo, TodoStatus } from './entities/Todo.js';
import { TodoUseCases } from './usecases/TodoUseCases.js';
import { TodoDatabase } from './frameworks/database/TodoDatabase.js';
import { DexieTodoRepository } from './adapters/repositories/DexieTodoRepository.js';
import { TodoApp } from './ui/components/TodoApp.js';

/**
 * 앱 초기화 함수
 */
async function initializeApp() {
  try {
    console.log('Todo 앱을 초기화합니다...');
    
    // 데이터베이스 초기화
    const database = new TodoDatabase();
    await database.initialize();
    
    // 의존성 주입
    const todoRepository = new DexieTodoRepository(database);
    const todoUseCases = new TodoUseCases(todoRepository);
    
    // UI 컴포넌트 초기화
    const todoApp = new TodoApp(todoUseCases);
    
    console.log('Todo 앱이 성공적으로 초기화되었습니다.');
  } catch (error) {
    console.error('Todo 앱 초기화 중 오류가 발생했습니다:', error);
    alert('앱을 초기화하는 중 오류가 발생했습니다. 콘솔을 확인하세요.');
  }
}

// 페이지 로드 시 앱 초기화
document.addEventListener('DOMContentLoaded', initializeApp);
