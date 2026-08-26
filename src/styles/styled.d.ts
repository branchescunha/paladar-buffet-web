import 'styled-components';
import type { AppTheme } from './theme';

declare module 'styled-components' {
  // styled-components requires declaration merging for theme typing.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
