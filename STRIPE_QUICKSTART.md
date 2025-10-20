# Stripe Quick Start

## Быстрая настройка для тестирования

### 1. Переменные окружения

Добавь в `.env.local`:

```env
# Stripe (получи на https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=  # оставь пустым пока

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 2. Установи Stripe CLI

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

### 3. Запусти webhook forwarding (в отдельном терминале)

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Скопируй `whsec_...` который выдаст команда и добавь в `.env.local` как `STRIPE_WEBHOOK_SECRET`.

### 4. Запусти dev сервер

```bash
bun dev
```

### 5. Создай тестовый товар

Открой: http://localhost:3001/admin/add-product

Заполни форму:
- Name: Test Product
- Price EUR: 19.99
- Price USD: 21.99
- Stock: 10
- Weight: 200

Нажми "Create Product" - товар создастся и в Stripe, и в твоей БД.

### 6. Проверь товары

Открой: http://localhost:3001/shop

Увидишь созданный товар.

### 7. Проверь в Stripe Dashboard

Открой: https://dashboard.stripe.com/test/products

Увидишь созданный товар там же.

## Тестовые карты

При оплате используй:
- **Успешная оплата**: `4242 4242 4242 4242`
- **Отклонена**: `4000 0000 0000 0002`

Любая дата в будущем, любой CVC, любой почтовый индекс.

## Что дальше?

1. Создай страницу отдельного товара `/shop/[slug]/page.tsx`
2. Добавь корзину
3. Добавь форму checkout с адресом доставки
4. Добавь страницу истории заказов для пользователя
5. Добавь админ-панель для управления заказами

Подробная документация: `STRIPE_INTEGRATION.md`

