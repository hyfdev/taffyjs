import {
  AvailableSpaceKind,
  Display,
  TrackSizingKind,
  type AvailableSpaceInput,
  type EnumValue,
} from "@taffyjs/node";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? true
    : false;
type Expect<Value extends true> = Value;

type DisplayValue = EnumValue<typeof Display>;
type _DisplayMembers = Expect<Equal<DisplayValue, 0 | 1 | 2 | 3 | 4>>;

const block: 0 = Display.Block;
const fractionalTrack: 6 = TrackSizingKind.Fr;
void block;
void fractionalTrack;

function definiteValue(space: AvailableSpaceInput): number | undefined {
  if (space.kind === AvailableSpaceKind.Definite) return space.value;
  return undefined;
}

void definiteValue;
