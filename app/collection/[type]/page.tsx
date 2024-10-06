'use server'

import React from 'react'
import { IBarometerType } from '@/models/type'
import { IBarometer } from '@/models/barometer'
import { barometerTypesApiRoute, barometersApiRoute } from '../../constants'

interface CollectionProps {
  params: {
    type: string
  }
}
export default async function Collection({ params: { type } }: CollectionProps) {
  const res = await fetch(`${process.env.NEXTAUTH_URL + barometersApiRoute}?type=${type}`, {
    next: { revalidate: 60 }, // ISR (обновляем страницу каждые 60 секунд)
  })

  if (!res.ok) {
    // Обрабатываем ошибки, если запрос не успешен
    return <div>Error fetching data</div>
  }

  const barometersOfType: IBarometer[] = await res.json() // Парсим JSON данные из ответа

  return (
    <div>
      <h1>Type {type}</h1>

      {/* Дополнительная логика рендера данных из data */}
      {barometersOfType?.map(({ name, _id }) => <p key={_id}>{name}</p>)}
    </div>
  )
}

export async function generateStaticParams() {
  const res = await fetch(process.env.NEXTAUTH_URL + barometerTypesApiRoute)
  const barometerTypes: IBarometerType[] = await res.json()

  return barometerTypes.map((type: { name: string }) => ({
    type: type.name.toLowerCase(), // Генерируем параметры на основе типов
  }))
}
