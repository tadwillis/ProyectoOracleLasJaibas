import React, { useState } from "react";
import { Button, TextField, Box } from '@mui/material';

function NewItem(props) {
  const [item, setItem] = useState('');

  function handleSubmit(e) {
    if (!item.trim()) return;
    props.addItem(item);
    setItem("");
    e.preventDefault();
  }

  return (
    <Box sx={{ display: "flex", gap: 2, width: "100%", maxWidth: "500px" }}>
      <TextField
        fullWidth
        size="small"
        label="Nueva tarea"
        variant="outlined"
        value={item}
        onChange={(e) => setItem(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
      />
      <Button
        variant="contained"
        sx={{
          backgroundColor: "#CC4F37",
          color: "#ffffff",
          borderRadius: "6px",
          textTransform: "none",
          fontWeight: "bold",
          px: 3,
          '&:hover': { backgroundColor: "#9b3c2aff" }
        }}
        disabled={props.isInserting}
        onClick={!props.isInserting ? handleSubmit : null}
      >
        {props.isInserting ? 'Agregando…' : 'Agregar'}
      </Button>
    </Box>
  );
}

export default NewItem;
