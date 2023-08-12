import { FC, useCallback, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";

interface Props {
  currentValue: number;
  updatedQuantity: (newValue: number) => void;
  maxValue: number;
}
export const ItemCounter: FC<Props> = ({
  currentValue,
  updatedQuantity,
  maxValue,
}) => {
  const addOrRemove = useCallback(
    (value: number) => {
      if (value === -1) {
        if (currentValue === 1) return;

        return updatedQuantity(currentValue - 1);
      }

      if (currentValue >= maxValue) return;
      updatedQuantity(currentValue + 1);
    },
    [currentValue, maxValue, updatedQuantity]
  );

  return (
    <Box display="flex" alignItems="center">
      <IconButton onClick={() => addOrRemove(-1)}>
        <RemoveCircleOutline />
      </IconButton>
      <Typography sx={{ width: 40, textAlign: "center" }}>
        {currentValue}
      </Typography>
      <IconButton onClick={() => addOrRemove(1)}>
        <AddCircleOutline />
      </IconButton>
    </Box>
  );
};
