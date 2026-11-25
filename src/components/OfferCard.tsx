import {
  ActionIcon,
  Badge,
  Card,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
  VisuallyHidden,
} from '@mantine/core'
import { useState, type ReactElement } from 'react'
import { pricePerSquareUnit, type Offer, type OfferRank } from '../lib/offer'
import type { Pizza, SizeUnit } from '../lib/pizza'
import { OfferVisual } from './OfferVisual'
import { PizzaFields } from './PizzaFields'
import { rankColor } from './rankColor'
import { toNumber } from './toNumber'
import { offerNameId } from './focusIds'
import { TrashIcon } from './TrashIcon'
import './OfferCard.css'

interface OfferCardProps {
  offer: Offer
  currency: string
  priceUnit: SizeUnit
  priceFormat: Intl.NumberFormat
  rank: OfferRank | null
  maxSizeInches: number
  showBundles: boolean
  onChange: (changes: Partial<Pick<Offer, 'name' | 'notes' | 'price'>>) => void
  onPizzaChange: (pizzaId: number, changes: Partial<Pizza>) => void
  onAddPizza: () => void
  onRemovePizza: (pizzaId: number) => void
  onRemove: () => void
}

export function OfferCard({
  offer,
  currency,
  priceUnit,
  priceFormat,
  rank,
  maxSizeInches,
  showBundles,
  onChange,
  onPizzaChange,
  onAddPizza,
  onRemovePizza,
  onRemove,
}: Readonly<OfferCardProps>): ReactElement {
  const unitPrice = pricePerSquareUnit(offer, priceUnit)
  const isBest = rank?.rank === 1
  const [selectedIndex, setSelectedIndex] = useState(0)
  // A removed pizza can leave the selection past the end.
  const index = Math.min(selectedIndex, offer.pizzas.length - 1)
  const pizza = offer.pizzas[index]

  // The new pizza is appended, so it will be the last one.
  function handleAddPizza(): void {
    onAddPizza()
    setSelectedIndex(offer.pizzas.length)
  }

  const fields = (
    <PizzaFields
      pizza={pizza}
      index={index}
      count={offer.pizzas.length}
      showBundles={showBundles}
      onChange={(changes) => onPizzaChange(pizza.id, changes)}
      onAdd={handleAddPizza}
      onRemove={() => onRemovePizza(pizza.id)}
    />
  )

  return (
    <Card
      component="section"
      withBorder
      padding="md"
      radius="md"
      className={isBest ? 'offer best' : 'offer'}
    >
      <Stack gap="md">
        <Stack gap="xs">
          <Group gap="xs" wrap="nowrap">
            <TextInput
              id={offerNameId(offer.id)}
              aria-label="Name"
              value={offer.name}
              onChange={(event) => onChange({ name: event.currentTarget.value })}
              style={{ flex: 1, minWidth: 0 }}
            />
            <ActionIcon
              variant="light"
              color="red"
              size={36}
              aria-label="Remove offer"
              title="Remove offer"
              onClick={onRemove}
            >
              <TrashIcon />
            </ActionIcon>
          </Group>
          <NumberInput
            label={`Price (${currency})`}
            description={showBundles ? 'What you pay for the whole offer.' : undefined}
            min={0}
            allowNegative={false}
            allowLeadingZeros={false}
            decimalScale={2}
            hideControls
            defaultValue={offer.price}
            onChange={(value) => onChange({ price: toNumber(value) })}
          />
          <Group justify="space-between" wrap="nowrap" mih={22}>
            <Text fw={700}>
              {unitPrice === null ? '—' : `${priceFormat.format(unitPrice)} / ${priceUnit}²`}
            </Text>
            {rank && (
              <Text size="sm" fw={isBest ? 700 : 400} c={isBest ? 'green' : 'dimmed'}>
                {isBest
                  ? 'Best value'
                  : `+${Math.max(1, Math.round(rank.percentAboveBest))}% vs best`}
              </Text>
            )}
          </Group>
        </Stack>
        <Paper withBorder radius="md" p="sm" className="pizza-box">
          <Stack gap="md">
            <div className="visual-frame">
              {rank && (
                <Badge
                  size="lg"
                  color={rankColor(rank.rank)}
                  title={isBest ? `Rank ${rank.rank}, best value` : `Rank ${rank.rank}`}
                  className="rank"
                >
                  <VisuallyHidden>Rank </VisuallyHidden>#{rank.rank}
                </Badge>
              )}
              <OfferVisual
                pizza={pizza}
                maxSizeInches={maxSizeInches}
                index={index}
                count={offer.pizzas.length}
                onSelect={setSelectedIndex}
              />
            </div>
            {fields}
          </Stack>
        </Paper>
        <Textarea
          label="Notes"
          rows={2}
          resize="none"
          value={offer.notes}
          onChange={(event) => onChange({ notes: event.currentTarget.value })}
        />
      </Stack>
    </Card>
  )
}
