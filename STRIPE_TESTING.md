# Stripe Testing Guide

## Пошаговая инструкция для тестирования покупки

### Шаг 1: Подготовка

1. **Убедись, что переменные окружения настроены:**
   ```bash
   # В .env.local должны быть:
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   NEXT_PUBLIC_BASE_URL=http://localhost:3001
   ```

2. **Запусти Stripe CLI для webhooks (в отдельном терминале):**
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

   Скопируй `whsec_...` который выдаст команда и добавь в `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Перезапусти dev сервер:**
   ```bash
   bun dev
   ```

### Шаг 2: Получи необходимые ID из базы данных

1. **Открой Prisma Studio:**
   ```bash
   bun run prisma
   ```

2. **Найди свой User ID:**
   - Открой таблицу `User`
   - Скопируй свой `id` (UUID)

3. **Найди Product ID:**
   - Открой таблицу `Product`
   - Найди созданный товар
   - Скопируй его `id` (UUID)

### Шаг 3: Тестовая покупка

1. **Открой страницу тестирования:**
   ```
   http://localhost:3001/shop/test-checkout
   ```

2. **Заполни форму:**
   - **User ID**: Вставь свой User ID из базы
   - **Product ID**: Вставь Product ID из базы
   - **Quantity**: Оставь 1 (или измени)

3. **Нажми "Checkout with Stripe"**

4. **Ты попадёшь на страницу Stripe Checkout**

### Шаг 4: Оплата тестовой картой

На странице Stripe Checkout введи:

- **Email**: Любой email (например, test@example.com)
- **Card number**: `4242 4242 4242 4242` (успешная оплата)
- **Expiry**: Любая дата в будущем (например, 12/34)
- **CVC**: Любые 3 цифры (например, 123)
- **Name**: Любое имя
- **Country**: Любая страна
- **Postal code**: Любой (например, 12345)

Нажми **"Pay"**

### Шаг 5: Проверка результата

1. **После успешной оплаты:**
   - Тебя перенаправит на `/checkout/success`
   - Увидишь детали заказа

2. **Проверь терминал с Stripe CLI:**
   Должны появиться логи:
   ```
   --> checkout.session.completed
   <-- [200] POST http://localhost:3001/api/stripe/webhook
   ```

3. **Проверь терминал dev сервера:**
   Должны быть логи:
   ```
   Order <order-id> marked as PAID
   ```

4. **Проверь базу данных (Prisma Studio):**

   **Таблица `Order`:**
   - Найди свой заказ по `orderNumber`
   - `status` должен быть `PAID`
   - `stripePaymentIntentId` должен быть заполнен

   **Таблица `Payment`:**
   - Должна появиться запись с твоим `orderId`
   - `status` = `SUCCEEDED`
   - `paidAt` заполнен

   **Таблица `Product`:**
   - `stock` должен уменьшиться на количество купленных товаров

   **Таблица `OrderItem`:**
   - Должна быть запись с товаром и ценой на момент покупки

5. **Проверь Stripe Dashboard:**
   - Открой https://dashboard.stripe.com/test/payments
   - Найди свой платёж
   - Статус должен быть "Succeeded"

### Шаг 6: Тестирование других сценариев

#### Отмена оплаты:
1. На странице Stripe Checkout нажми кнопку "Back" или закрой вкладку
2. Тебя перенаправит на `/checkout/cancel`

#### Отклонённая карта:
Используй карту `4000 0000 0000 0002` - платёж будет отклонён

#### 3D Secure:
Используй карту `4000 0025 0000 3155` - появится дополнительная проверка

#### Недостаточный stock:
1. В Prisma Studio измени `stock` товара на 0
2. Попробуй купить — получишь ошибку "Insufficient stock"

### Шаг 7: Тестирование возврата (Refund)

1. **Открой Stripe Dashboard:**
   https://dashboard.stripe.com/test/payments

2. **Найди свой платёж и открой его**

3. **Нажми "Refund payment"**

4. **Выбери:**
   - **Full refund** (полный возврат)
   - Или **Partial refund** (частичный)

5. **Подтверди возврат**

6. **Проверь webhook в терминале:**
   ```
   --> charge.refunded
   <-- [200] POST http://localhost:3001/api/stripe/webhook
   ```

7. **Проверь базу данных:**
   - **Order**: `status` = `REFUNDED` (если полный возврат)
   - **Payment**: `status` = `REFUNDED`, `refundAmount` заполнен
   - **Product**: `stock` восстановлен (если полный возврат)

## Возможные проблемы и решения

### Webhook не работает

**Проблема:** Заказ остаётся в статусе PENDING, stock не уменьшается

**Решение:**
1. Убедись, что Stripe CLI запущен
2. Проверь, что `STRIPE_WEBHOOK_SECRET` в `.env.local`
3. Перезапусти dev сервер после добавления webhook secret
4. Проверь логи в терминале Stripe CLI

### "User not found"

**Проблема:** Ошибка при создании checkout

**Решение:**
- Убедись, что User ID правильный
- Проверь, что пользователь существует в таблице `User`

### "Product not found"

**Проблема:** Ошибка при создании checkout

**Решение:**
- Убедись, что Product ID правильный
- Проверь, что товар существует и `isActive = true`

### "Insufficient stock"

**Проблема:** Ошибка при попытке купить

**Решение:**
- Проверь `stock` товара в базе
- Убедись, что stock >= quantity

### Webhook приходит дважды

**Это нормально!** Stripe может отправить webhook несколько раз.
Наша система идемпотентна — повторные webhook игнорируются.

### Customer creation failed

**Проблема:** Ошибка "Failed to create customer in payment system"

**Решение:**
- Проверь `STRIPE_SECRET_KEY`
- Убедись, что Stripe API доступен
- Проверь логи в консоли

## Тестовые карты Stripe

| Карта | Результат |
|-------|-----------|
| `4242 4242 4242 4242` | Успешная оплата |
| `4000 0000 0000 0002` | Отклонена |
| `4000 0025 0000 3155` | 3D Secure |
| `4000 0000 0000 9995` | Недостаточно средств |
| `4000 0000 0000 0069` | Карта просрочена |

Все карты:
- **Expiry**: Любая дата в будущем
- **CVC**: Любые 3 цифры
- **Postal code**: Любой

## Что проверять после каждого теста

- [ ] Order создан с правильным статусом
- [ ] Payment запись создана
- [ ] Stock уменьшился/восстановился
- [ ] Webhook пришёл и обработан
- [ ] Stripe Dashboard показывает правильный статус
- [ ] Success/Cancel страница отображается корректно
- [ ] Логи в терминалах без ошибок

## Полезные команды

```bash
# Просмотр логов Stripe CLI
stripe logs tail

# Триггер тестового webhook
stripe trigger checkout.session.completed

# Просмотр всех событий
stripe events list

# Просмотр конкретного платежа
stripe payments retrieve pi_xxx
```

## Следующие шаги

После успешного тестирования:
1. Добавь реальную страницу магазина с каталогом
2. Добавь корзину
3. Добавь интеграцию с auth (вместо ручного ввода User ID)
4. Добавь email уведомления
5. Добавь расчёт доставки
6. Добавь админ-панель для управления заказами

Удачи! 🚀

