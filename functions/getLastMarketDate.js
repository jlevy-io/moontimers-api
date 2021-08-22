const getLastMarketDate = () => {
  const workingDate = new Date();
  const todayDate = workingDate.getDate();

  // If Monday, set to previous Friday
  if (workingDate.getDay() === 1) {
    workingDate.setDate(todayDate - 3);
    return workingDate;
  }

  workingDate.setDate(todayDate - 1);
  return workingDate;
};
