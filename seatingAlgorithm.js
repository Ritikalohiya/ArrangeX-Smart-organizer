export const generateSeatingArrangement = (
  students,
  halls
) => {
  const shuffledStudents = [...students].sort(
    () => Math.random() - 0.5
  );

  const allSeats = [];

  halls.forEach((hall) => {
    for (
      let row = 1;
      row <= hall.rows;
      row++
    ) {
      for (
        let column = 1;
        column <= hall.columns;
        column++
      ) {
        allSeats.push({
          hallId: hall._id,
          hallName: hall.name,

          row,

          column,

          seatNumber: `${String.fromCharCode(
            64 + row
          )}${column}`,

          student: null,
        });
      }
    }
  });

  let studentIndex = 0;

  for (
    let i = 0;
    i < allSeats.length &&
    studentIndex < shuffledStudents.length;
    i++
  ) {
    const currentSeat = allSeats[i];

    const previousSeat = allSeats[i - 1];

    const student =
      shuffledStudents[studentIndex];

    // Prevent same course students
    // from sitting consecutively
    if (
      previousSeat &&
      previousSeat.student &&
      previousSeat.student.course ===
        student.course
    ) {
      continue;
    }

    currentSeat.student = student;

    studentIndex++;
  }

  return {
    seats: allSeats,

    remainingStudents:
      shuffledStudents.length -
      studentIndex,
  };
};