// Тест ошибки линтинга - неиспользуемая переменная

const unusedVariable = 'this should cause lint error'

export const usedFunction = () => {
  return 'hello world'
}
