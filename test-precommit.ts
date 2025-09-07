// Тестовый файл с ошибками для проверки pre-commit хуков

// TypeScript ошибка - неправильный тип
const badVariable: string = '123'

// Ошибка форматирования - плохие отступы и точки с запятой
function badFunction(param: any) {
  return param.someProperty.that.does.not.exist
}

// Неиспользуемая переменная
const unusedVar = 'test'

// Плохое форматирование объекта
const badObject = { name: 'test', value: 42, items: [1, 2, 3, 4, 5] }

export { badFunction }
