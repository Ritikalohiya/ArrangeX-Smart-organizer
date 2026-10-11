export const generateSeats = (
  rows,
  columns
) => {
  const seats = [];

  for (let row = 1; row <= rows; row++) {
    for (
      let column = 1;
      column <= columns;
      column++
    ) {
      seats.push({
        seatNumber: `${String.fromCharCode(
          64 + row
        )}${column}`,

        row,

        column,

        student: null,

        rollNumber: "",

        status: "available",
      });
    }
  }

  return seats;
};