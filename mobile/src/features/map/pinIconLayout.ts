/** Shared layout for pin marker + caption under the tip (native draw + JS anchor). */
export const PIN_MAP_WIDTH = 56;
export const PIN_MAP_HEIGHT = (370 / 300) * PIN_MAP_WIDTH;
/** Gap between pin tip and the black AC/DC box. */
export const PIN_LABEL_GAP = 3;
export const PIN_LABEL_BOX_HEIGHT = 15;
export const PIN_ICON_TOTAL_HEIGHT =
  PIN_MAP_HEIGHT + PIN_LABEL_GAP + PIN_LABEL_BOX_HEIGHT;
/** Ground anchor Y so the coordinate sits on the pin tip, not the caption. */
export const PIN_TIP_ANCHOR_Y = PIN_MAP_HEIGHT / PIN_ICON_TOTAL_HEIGHT;
