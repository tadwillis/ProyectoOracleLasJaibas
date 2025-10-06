import React from "react";
import { Grid, Card, CardContent, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Moment from "react-moment";

const KanbanBoard = ({ items, toggleDone, deleteItem }) => {
  const renderColumn = (title, filterFn, color) => (
    <Grid item xs={12} md={3}>
      <Typography
        variant="h6"
        align="center"
        sx={{ color, mb: 2, fontWeight: "bold" }}
      >
        {title}
      </Typography>
      {items.filter(filterFn).map((item) => (
        <Card
          key={item.id}
          sx={{
            mb: 2,
            background: "#1e1e1e",
            color: "white",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <CardContent>
            <Typography variant="body1">{item.description}</Typography>
            <Typography variant="caption" color="gray">
              <Moment format="MMM Do HH:mm">{item.createdAt}</Moment>
            </Typography>
            <div style={{ marginTop: "0.5rem" }}>
              <Button
                variant="contained"
                size="small"
                sx={{ mr: 1 }}
                onClick={(event) =>
                  toggleDone(event, item.id, item.description, !item.done)
                }
              >
                {item.done ? "Undo" : "Done"}
              </Button>
              {item.done && (
                <Button
                  startIcon={<DeleteIcon />}
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => deleteItem(item.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </Grid>
  );

  return (
    <Grid
      container
      spacing={3}
      sx={{
        padding: 3,
        background: "#121212",
        minHeight: "100vh",
        borderRadius: 2,
      }}
    >
      {renderColumn("To Do", (t) => !t.done, "#ff9800")}
      {renderColumn("Done", (t) => t.done, "#F80000")}
    </Grid>
  );
};

export default KanbanBoard;
